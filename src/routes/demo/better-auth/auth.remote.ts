import { query } from '$app/server';
import { auth } from '$lib/server/auth';

export const getCurrentUser = query(async () => {
	const session = await auth.api.getSession({ headers: {} });
	return session?.user ?? null;
});
