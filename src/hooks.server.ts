import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

/**
 * SvelteKit Server Hooks
 *
 * Uses Better Auth's official svelteKitHandler which:
 * - Handles all auth requests at /api/auth/*
 * - Manages session cookies automatically
 * - Provides CSRF protection
 * - Works during both build and runtime
 */

export const handle: Handle = async ({ event, resolve }) => {
	// Populate event.locals with session data for server-side access
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	// Use Better Auth's official SvelteKit handler
	// This handles all /api/auth/* routes and cookie management
	return svelteKitHandler({ event, resolve, auth, building });
};
