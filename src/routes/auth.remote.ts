import { command } from '$app/server';
import { z } from 'zod';

/**
 * Authentication Remote Functions
 *
 * Note: Authentication uses Better Auth client directly in components.
 * These remote functions are for any additional server-side operations.
 *
 * For session management, use `authClient.useSession()` from Better Auth client.
 */

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Sign up validation schema
 * Exported for reuse in other modules
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
 * Exported for reuse in other modules
 */
export const signInSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
	password: z.string().min(1, 'Password is required')
});

// ============================================================================
// Remote Functions
// ============================================================================

/**
 * Sign Out
 *
 * Server-side sign out for any additional cleanup
 * Note: Actual sign out is handled by Better Auth client
 */
export const signOut = command(async () => {
	// Placeholder for any server-side cleanup on sign out
	// Actual sign out is handled by authClient.signOut() in components
});
