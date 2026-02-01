import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/features/auth/server/auth';
import { building } from '$app/environment';

export async function handle({ resolve, event }) {
	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});
	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}
	return svelteKitHandler({ building, resolve, event, auth });
}
