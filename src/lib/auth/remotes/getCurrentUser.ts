import { getRequestEvent, query } from '$app/server';

// Query for getting current user
export const getCurrentUser = query(async () => {
	const event = getRequestEvent();
	return event.locals.user;
});
