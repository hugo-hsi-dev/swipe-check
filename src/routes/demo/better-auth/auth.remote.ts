import { command } from '$app/server';
import { isRedirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const signOut = command(async () => {
	try {
		await auth.api.signOut({ headers: {} });
	} catch (error) {
		if (isRedirect(error)) throw error;
		throw error;
	}
});
