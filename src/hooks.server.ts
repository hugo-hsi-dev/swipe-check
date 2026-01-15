import type { Handle } from '@sveltejs/kit';
import { authService, sessionCookieName } from '$lib/server/auth';

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

export const handle: Handle = handleAuth;
