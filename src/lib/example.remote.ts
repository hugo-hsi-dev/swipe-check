import { query } from '$app/server';
import { db } from './server/db';

export const getUser = query(() => {
	const user = db.query.user.findFirst();
	return user;
});
