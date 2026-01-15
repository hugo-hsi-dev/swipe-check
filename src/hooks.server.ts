import type { Handle } from '@sveltejs/kit';
import { AuthService, sessionCookieName } from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		return resolve(event);
	}

	const { session, user } = await AuthService.session.validate(sessionToken);

	if (session) {
		AuthService.session.setCookie(event, sessionToken, session.expiresAt);
	} else {
		AuthService.session.deleteCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = handleAuth;
