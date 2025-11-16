import { createAuthClient } from 'better-auth/svelte';

/**
 * Better Auth Client
 *
 * Client-side Better Auth instance for authentication operations
 * Use this in Svelte components for sign up, sign in, sign out, etc.
 *
 * Note: createAuthClient() uses sensible defaults that work out of the box
 */
export const authClient = createAuthClient();

/**
 * Export commonly used auth methods for convenience
 */
export const { signIn, signUp, signOut, useSession } = authClient;
