import { query } from '$app/server';
import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export const getUser = query(async () => {
	const event = getRequestEvent();
	return event.locals.user ?? null;
});

export const requireUser = query(async () => {
	const user = await getUser();
	if (!user) {
		error(401, 'You must be signed in to access this resource.');
	}
	return user;
});
