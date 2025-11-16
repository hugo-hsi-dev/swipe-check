import { createAuthClient } from 'better-auth/svelte';

/**
 * Better Auth Client
 *
 * Client-side Better Auth instance for authentication operations
 * Use this in Svelte components for sign up, sign in, sign out, etc.
 */
export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : ''
});

/**
 * Export commonly used auth methods for convenience
 */
export const {
	signIn,
	signUp,
	signOut,
	useSession
} = authClient;
