import { form, command } from '$app/server';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userStats } from '$lib/server/db/schema';

/**
 * Authentication Remote Functions
 *
 * Provides type-safe server functions for authentication:
 * - Sign up with email/password (with validation and user stats creation)
 * - Sign in with email/password (with validation)
 * - Sign out
 */

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
export const signUp = form(async (formData) => {
	// Extract form data
	const rawData = {
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password')
	};

	// Validate input
	const result = signUpSchema.safeParse(rawData);
	if (!result.success) {
		const errors = result.error.flatten().fieldErrors;
		return {
			success: false,
			error: errors.name?.[0] || errors.email?.[0] || errors.password?.[0] || 'Validation failed'
		};
	}

	const { name, email, password } = result.data;

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
export const signIn = form(async (formData) => {
	// Extract form data
	const rawData = {
		email: formData.get('email'),
		password: formData.get('password')
	};

	// Validate input
	const result = signInSchema.safeParse(rawData);
	if (!result.success) {
		const errors = result.error.flatten().fieldErrors;
		return {
			success: false,
			error: errors.email?.[0] || errors.password?.[0] || 'Validation failed'
		};
	}

	const { email, password } = result.data;

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
