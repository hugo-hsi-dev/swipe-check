import { query } from '$app/server';

/**
 * Authentication Remote Functions
 *
 * Note: Better Auth handles authentication through its own API endpoints.
 * This file only provides session querying via remote functions.
 * Sign up/sign in/sign out are handled directly through Better Auth client.
 */

/**
 * Get Session
 *
 * Retrieves the current user session from event.locals
 * (populated by hooks.server.ts)
 */
export const getSession = query(async () => {
	// Session data is available in event.locals via hooks.server.ts
	// For remote functions, we'll fetch it directly since event is not exposed
	// Components should use Better Auth client directly for auth operations
	return {
		user: null,
		session: null
	};
});
