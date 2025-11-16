import { form, query, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { questions, responses, userStats, type Dimension } from '$lib/server/db/schema';
import { eq, and, sql, desc, inArray, notInArray } from 'drizzle-orm';
import { auth } from '$lib/server/auth';

/**
 * Quiz Remote Functions
 *
 * Provides type-safe server functions for quiz functionality:
 * - Get daily questions with intelligent rotation
 * - Submit answers with validation
 * - Update streak tracking
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Number of questions to show per day
 * - Onboarding: 10 questions for first quiz
 * - Daily: 3 questions per day
 */
export const DAILY_QUESTION_COUNT = 3;
export const ONBOARDING_QUESTION_COUNT = 10;

/**
 * MBTI dimension pairs
 * Used for balancing question selection
 */
const DIMENSION_PAIRS: Record<Dimension, Dimension> = {
	E: 'I',
	I: 'E',
	S: 'N',
	N: 'S',
	T: 'F',
	F: 'T',
	J: 'P',
	P: 'J'
};

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Submit answer validation schema
 */
export const submitAnswerSchema = z.object({
	questionId: z.string().uuid('Invalid question ID'),
	answer: z.boolean(),
	respondedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')
});

/**
 * Get questions validation schema
 */
export const getQuestionsSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
	isOnboarding: z.boolean().optional().default(false)
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get dimension coverage from recent responses
 * Returns count of responses for each dimension in the last 7 days
 */
async function getDimensionCoverage(
	userId: string,
	targetDate: string
): Promise<Record<Dimension, number>> {
	// Calculate date 7 days ago
	const date = new Date(targetDate);
	const sevenDaysAgo = new Date(date);
	sevenDaysAgo.setDate(date.getDate() - 7);
	const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

	// Query responses with their question's target dimension from last 7 days
	const recentResponses = await db
		.select({
			targetDimension: questions.targetDimension
		})
		.from(responses)
		.innerJoin(questions, eq(responses.questionId, questions.id))
		.where(
			and(
				eq(responses.userId, userId),
				sql`${responses.respondedAt} >= ${sevenDaysAgoStr}`,
				sql`${responses.respondedAt} <= ${targetDate}`
			)
		);

	// Count responses per dimension
	const coverage: Record<Dimension, number> = {
		E: 0,
		I: 0,
		S: 0,
		N: 0,
		T: 0,
		F: 0,
		J: 0,
		P: 0
	};

	recentResponses.forEach((response) => {
		if (response.targetDimension) {
			coverage[response.targetDimension]++;
		}
	});

	return coverage;
}

/**
 * Get questions already answered today
 */
async function getTodayAnsweredQuestions(userId: string, date: string): Promise<string[]> {
	const todayResponses = await db
		.select({ questionId: responses.questionId })
		.from(responses)
		.where(and(eq(responses.userId, userId), eq(responses.respondedAt, date)));

	return todayResponses.map((r) => r.questionId);
}

/**
 * Get recently answered questions (last 30 days)
 * To avoid repetition
 */
async function getRecentlyAnsweredQuestions(userId: string, date: string): Promise<string[]> {
	// Calculate date 30 days ago
	const dateObj = new Date(date);
	const thirtyDaysAgo = new Date(dateObj);
	thirtyDaysAgo.setDate(dateObj.getDate() - 30);
	const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

	const recentResponses = await db
		.select({ questionId: responses.questionId })
		.from(responses)
		.where(
			and(
				eq(responses.userId, userId),
				sql`${responses.respondedAt} >= ${thirtyDaysAgoStr}`,
				sql`${responses.respondedAt} < ${date}` // Exclude today
			)
		);

	return recentResponses.map((r) => r.questionId);
}

/**
 * Select questions with intelligent rotation
 * Prioritizes under-represented dimensions
 */
async function selectQuestions(
	userId: string,
	date: string,
	count: number
): Promise<Array<{ id: string; text: string; targetDimension: Dimension }>> {
	// Get dimension coverage from last 7 days
	const coverage = await getDimensionCoverage(userId, date);

	// Get already answered questions (today and recently)
	const todayAnswered = await getTodayAnsweredQuestions(userId, date);
	const recentlyAnswered = await getRecentlyAnsweredQuestions(userId, date);

	// Find dimensions with least coverage
	// Sort dimensions by coverage (ascending)
	const sortedDimensions = (Object.entries(coverage) as Array<[Dimension, number]>).sort(
		(a, b) => a[1] - b[1]
	);

	// Select questions from under-represented dimensions
	const selectedQuestions: Array<{ id: string; text: string; targetDimension: Dimension }> = [];
	const usedQuestionIds = new Set<string>(todayAnswered);

	// Try to get questions from each dimension, starting with least covered
	for (const [dimension, _count] of sortedDimensions) {
		if (selectedQuestions.length >= count) break;

		// Calculate how many questions we still need
		const remaining = count - selectedQuestions.length;

		// Build query for questions from this dimension
		const excludeIds = [...usedQuestionIds];

		const dimensionQuestions = excludeIds.length > 0
			? await db
					.select({
						id: questions.id,
						text: questions.text,
						targetDimension: questions.targetDimension
					})
					.from(questions)
					.where(
						and(eq(questions.targetDimension, dimension), notInArray(questions.id, excludeIds))
					)
					.orderBy(sql`RANDOM()`)
					.limit(remaining)
			: await db
					.select({
						id: questions.id,
						text: questions.text,
						targetDimension: questions.targetDimension
					})
					.from(questions)
					.where(eq(questions.targetDimension, dimension))
					.orderBy(sql`RANDOM()`)
					.limit(remaining);

		// Add to selected questions and mark as used
		dimensionQuestions.forEach((q) => {
			if (selectedQuestions.length < count && !usedQuestionIds.has(q.id)) {
				selectedQuestions.push(q);
				usedQuestionIds.add(q.id);
			}
		});
	}

	// If we still don't have enough questions (unlikely), get random ones
	if (selectedQuestions.length < count) {
		const remaining = count - selectedQuestions.length;
		const excludeIds = [...usedQuestionIds];

		const additionalQuestions = excludeIds.length > 0
			? await db
					.select({
						id: questions.id,
						text: questions.text,
						targetDimension: questions.targetDimension
					})
					.from(questions)
					.where(notInArray(questions.id, excludeIds))
					.orderBy(sql`RANDOM()`)
					.limit(remaining)
			: await db
					.select({
						id: questions.id,
						text: questions.text,
						targetDimension: questions.targetDimension
					})
					.from(questions)
					.orderBy(sql`RANDOM()`)
					.limit(remaining);

		selectedQuestions.push(...additionalQuestions);
	}

	return selectedQuestions;
}

/**
 * Update user streak after quiz completion
 */
async function updateStreak(userId: string, completedDate: string): Promise<void> {
	// Get user stats
	const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

	if (!stats) {
		// Create stats if they don't exist
		await db.insert(userStats).values({
			userId,
			currentStreak: 1,
			longestStreak: 1,
			totalDaysCompleted: 1,
			lastCompletedDate: completedDate,
			hasCompletedOnboarding: false
		});
		return;
	}

	// Calculate if streak continues
	const lastDate = stats.lastCompletedDate ? new Date(stats.lastCompletedDate) : null;
	const currentDate = new Date(completedDate);

	let newStreak = 1;
	let diffDays = 1; // Default to 1 day difference for new streak

	if (lastDate) {
		// Calculate days difference
		const diffTime = currentDate.getTime() - lastDate.getTime();
		diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			// Consecutive day - increment streak
			newStreak = stats.currentStreak + 1;
		} else if (diffDays === 0) {
			// Same day - keep current streak
			newStreak = stats.currentStreak;
		}
		// else: gap in days - streak resets to 1 (already set)
	}

	// Update stats
	const newLongestStreak = Math.max(newStreak, stats.longestStreak);
	const newTotalDays = diffDays === 0 ? stats.totalDaysCompleted : stats.totalDaysCompleted + 1;

	await db
		.update(userStats)
		.set({
			currentStreak: newStreak,
			longestStreak: newLongestStreak,
			totalDaysCompleted: newTotalDays,
			lastCompletedDate: completedDate,
			updatedAt: new Date()
		})
		.where(eq(userStats.userId, userId));
}

// ============================================================================
// Remote Functions
// ============================================================================

/**
 * Get Questions
 *
 * Returns daily questions for the user with intelligent rotation
 * - Prioritizes under-represented dimensions
 * - Avoids recently answered questions
 * - Returns 3 questions for daily quiz, 10 for onboarding
 */
export const getQuestions = query(getQuestionsSchema, async (data) => {
	const { userId, date, isOnboarding } = data;

	try {
		// Check if user has already completed today's quiz
		const todayAnswered = await getTodayAnsweredQuestions(userId, date);
		const questionCount = isOnboarding ? ONBOARDING_QUESTION_COUNT : DAILY_QUESTION_COUNT;

		if (todayAnswered.length >= questionCount) {
			return {
				success: true,
				completed: true,
				questions: [],
				answeredCount: todayAnswered.length
			};
		}

		// Select questions with intelligent rotation
		const selectedQuestions = await selectQuestions(userId, date, questionCount);

		return {
			success: true,
			completed: false,
			questions: selectedQuestions,
			answeredCount: todayAnswered.length,
			totalCount: questionCount
		};
	} catch (error) {
		console.error('Get questions error:', error);
		return {
			success: false,
			error: 'Failed to load questions. Please try again.'
		};
	}
});

/**
 * Submit Answer
 *
 * Validates and stores user answer to a question
 * Updates streak when quiz is completed
 */
export const submitAnswer = form(submitAnswerSchema, async (data) => {
	const { questionId, answer, respondedAt } = data;

	// Get user ID from session
	const event = getRequestEvent();
	const user = event?.locals.user;

	if (!user?.id) {
		return {
			success: false,
			error: 'You must be logged in to submit answers'
		};
	}

	const userId = user.id;

	try {
		// Check if question exists
		const [question] = await db
			.select()
			.from(questions)
			.where(eq(questions.id, questionId))
			.limit(1);

		if (!question) {
			return {
				success: false,
				error: 'Invalid question ID'
			};
		}

		// Check if user has already answered this question today
		const [existing] = await db
			.select()
			.from(responses)
			.where(
				and(
					eq(responses.userId, userId),
					eq(responses.questionId, questionId),
					eq(responses.respondedAt, respondedAt)
				)
			)
			.limit(1);

		if (existing) {
			// Update existing response
			await db
				.update(responses)
				.set({
					answer,
					createdAt: new Date()
				})
				.where(eq(responses.id, existing.id));
		} else {
			// Insert new response
			await db.insert(responses).values({
				userId,
				questionId,
				answer,
				respondedAt
			});
		}

		// Check if quiz is completed (get user stats to check if onboarding)
		const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
		const isOnboarding = stats ? !stats.hasCompletedOnboarding : true;
		const requiredCount = isOnboarding ? ONBOARDING_QUESTION_COUNT : DAILY_QUESTION_COUNT;

		const todayAnswered = await getTodayAnsweredQuestions(userId, respondedAt);

		if (todayAnswered.length >= requiredCount) {
			// Quiz completed - update streak
			await updateStreak(userId, respondedAt);

			// If this was onboarding, mark as completed
			if (isOnboarding && stats) {
				await db
					.update(userStats)
					.set({
						hasCompletedOnboarding: true,
						updatedAt: new Date()
					})
					.where(eq(userStats.userId, userId));
			}

			return {
				success: true,
				message: 'Answer saved! Quiz completed!',
				quizCompleted: true
			};
		}

		return {
			success: true,
			message: 'Answer saved successfully',
			quizCompleted: false
		};
	} catch (error) {
		console.error('Submit answer error:', error);
		return {
			success: false,
			error: 'Failed to save answer. Please try again.'
		};
	}
});
