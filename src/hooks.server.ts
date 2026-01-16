import { redirect, error, type Handle } from '@sveltejs/kit';
import { authService, sessionCookieName } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		return resolve(event);
	}

	const { session, user } = await authService.validateSession(sessionToken);

	if (session) {
		authService.setSessionCookie(event, sessionToken, session.expiresAt);
	} else {
		authService.deleteSessionCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

const handleGuard: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;
	const path = event.url.pathname;

	if (path.startsWith('/app') && !user) {
		error(401, 'You must be signed in to access the application.');
	}

	if (path === '/login' || path === '/register') {
		if (user) {
			throw redirect(303, '/app');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleGuard);
