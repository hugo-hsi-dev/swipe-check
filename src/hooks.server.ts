import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { auth } from '$lib/server/auth';
import type { Session, User } from '$lib/features/auth/types';

export const handle: Handle = async ({ event, resolve }) => {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server via event.locals
	if (session) {
		event.locals.session = session.session as Session;
		event.locals.user = session.user as User;
	}

	// Delegate to Better Auth's SvelteKit handler to manage /api/auth and cookies
	return svelteKitHandler({ event, resolve, auth, building });
};
