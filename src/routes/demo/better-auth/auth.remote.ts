import { query } from '$app/server';
import { getRequestEvent } from '$app/server';

export const getCurrentUser = query(async () => {
	const event = getRequestEvent();
	return event?.locals.user ?? null;
});
