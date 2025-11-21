import { form, command, query, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/schema';

/**
 * Authentication Remote Functions
 *
 * Provides type-safe server functions for authentication:
 * - Get current user session (query with deduplication)
 * - Sign up with email/password (with validation and user stats creation)
 * - Sign in with email/password (with validation)
 * - Sign out
 */

// ============================================================================
// Session Query
// ============================================================================

/**
 * Get Current User
 *
 * Query function to retrieve the current authenticated user
 * Uses SvelteKit's query deduplication for performance
 * Can be imported and used across all remote function files
 *
 * @returns User object with id, name, email if authenticated, null otherwise
 */
export const getCurrentUser = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals.user;

	if (!user?.id) {
		return null;
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email
	};
});

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Sign up validation schema
 */
export const signUpSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Invalid email address')
		.toLowerCase()
		.trim(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password must be less than 128 characters')
});

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
	password: z.string().min(1, 'Password is required')
});

// ============================================================================
// Remote Functions
// ============================================================================

/**
 * Sign Up
 *
 * Creates a new user account with email/password
 * Automatically creates user stats record for streak tracking
 */
export const signUp = form(signUpSchema, async (data) => {
	const { name, email, password } = data;

	try {
		// Create user with Better Auth
		const response = await auth.api.signUpEmail({
			body: { name, email, password }
		});

		// Check for errors
		if (!response || 'error' in response) {
			return {
				success: false,
				error: 'Failed to create account. Email may already be in use.'
			};
		}

		// Create user stats record for the new user
		if (response.user?.id) {
			await db.insert(userStats).values({
				userId: response.user.id,
				currentStreak: 0,
				longestStreak: 0,
				totalDaysCompleted: 0,
				hasCompletedOnboarding: false
			});
		}

		return {
			success: true,
			message: 'Account created successfully!'
		};
	} catch (error) {
		console.error('Sign up error:', error);
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.'
		};
	}
});

/**
 * Sign In
 *
 * Authenticates user with email/password
 */
export const signIn = form(signInSchema, async (data) => {
	const { email, password } = data;

	try {
		// Sign in with Better Auth
		const response = await auth.api.signInEmail({
			body: { email, password }
		});

		// Check for errors
		if (!response || 'error' in response) {
			return {
				success: false,
				error: 'Invalid email or password'
			};
		}

		return {
			success: true,
			message: 'Signed in successfully!'
		};
	} catch (error) {
		console.error('Sign in error:', error);
		return {
			success: false,
			error: 'An unexpected error occurred. Please try again.'
		};
	}
});

/**
 * Sign Out
 *
 * Server-side sign out for any additional cleanup
 */
export const signOut = command(async () => {
	// Placeholder for any server-side cleanup on sign out
	// Actual sign out is handled by authClient.signOut() in components
});
