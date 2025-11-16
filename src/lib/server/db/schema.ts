import {
	pgTable,
	text,
	timestamp,
	boolean,
	uuid,
	integer,
	date,
	jsonb,
	pgEnum,
	uniqueIndex
} from 'drizzle-orm/pg-core';

/**
 * MBTI Dimension Enum
 * Represents the 8 MBTI dimensions:
 * - E (Extraversion) / I (Introversion)
 * - S (Sensing) / N (Intuition)
 * - T (Thinking) / F (Feeling)
 * - J (Judging) / P (Perceiving)
 */
export const dimensionEnum = pgEnum('dimension', ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']);

/**
 * Questions Table
 * Stores MBTI personality assessment questions
 */
export const questions = pgTable('questions', {
	id: uuid('id').defaultRandom().primaryKey(),
	text: text('text').notNull(),
	targetDimension: dimensionEnum('target_dimension').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

/**
 * Responses Table
 * Stores user responses to questions
 * Note: userId will reference Better Auth's user table (created in Task 3)
 */
export const responses = pgTable(
	'responses',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		// TODO: Add foreign key reference to Better Auth's user table in Task 3
		userId: uuid('user_id').notNull(),
		questionId: uuid('question_id')
			.references(() => questions.id, { onDelete: 'cascade' })
			.notNull(),
		answer: boolean('answer').notNull(), // true = agree, false = disagree
		respondedAt: date('responded_at').notNull(), // Date when user answered (for rolling window)
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		// Composite unique index: one response per user per question per day
		userQuestionDateIdx: uniqueIndex('user_question_date_idx').on(
			table.userId,
			table.questionId,
			table.respondedAt
		),
		// Index for efficient querying by user and date
		userRespondedAtIdx: uniqueIndex('user_responded_at_idx').on(table.userId, table.respondedAt)
	})
);

/**
 * User Stats Table
 * Tracks user engagement metrics and onboarding status
 * Note: userId will reference Better Auth's user table (created in Task 3)
 */
export const userStats = pgTable('user_stats', {
	// Primary key is also a foreign key to Better Auth's user table
	// TODO: Add foreign key reference to Better Auth's user table in Task 3
	userId: uuid('user_id').primaryKey(),
	currentStreak: integer('current_streak').default(0).notNull(),
	longestStreak: integer('longest_streak').default(0).notNull(),
	totalDaysCompleted: integer('total_days_completed').default(0).notNull(),
	lastCompletedDate: date('last_completed_date'), // Nullable for new users
	hasCompletedOnboarding: boolean('has_completed_onboarding').default(false).notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Personality Snapshots Table
 * Stores historical personality type calculations
 * Optional: Useful for tracking personality changes over time
 * Note: userId will reference Better Auth's user table (created in Task 3)
 */
export const personalitySnapshots = pgTable(
	'personality_snapshots',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		// TODO: Add foreign key reference to Better Auth's user table in Task 3
		userId: uuid('user_id').notNull(),
		personalityType: text('personality_type').notNull(), // 4-letter type (e.g., 'INFJ')
		dimensionScores: jsonb('dimension_scores').notNull(), // { E: 60, I: 40, S: 45, N: 55, ... }
		calculatedAt: date('calculated_at').notNull(),
		windowStart: date('window_start').notNull(), // Start of 7-day window
		windowEnd: date('window_end').notNull(), // End of 7-day window
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		// Index for efficient querying by user and calculation date
		userCalculatedAtIdx: uniqueIndex('user_calculated_at_idx').on(
			table.userId,
			table.calculatedAt
		)
	})
);

// Export TypeScript types for use in the application
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;

export type PersonalitySnapshot = typeof personalitySnapshots.$inferSelect;
export type NewPersonalitySnapshot = typeof personalitySnapshots.$inferInsert;

// Export dimension type for use in validation
export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
