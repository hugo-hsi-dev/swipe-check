import { auth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

/**
 * SvelteKit Server Hooks
 *
 * Handles:
 * - Better Auth requests at /api/auth/*
 * - Session management via event.locals
 * - CSRF protection
 */

export const handle: Handle = async ({ event, resolve }) => {
	// Handle Better Auth requests
	// Better Auth uses the /api/auth/* endpoint by default
	if (event.url.pathname.startsWith('/api/auth')) {
		return await auth.handler(event.request);
	}

	// Get session from Better Auth and add to event.locals
	try {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		// Add user and session to event.locals for use in server-side code
		event.locals.user = session?.user || null;
		event.locals.session = session?.session || null;
	} catch (error) {
		console.error('Error getting session in hooks:', error);
		event.locals.user = null;
		event.locals.session = null;
	}

	// Continue with normal request handling
	return resolve(event);
};
