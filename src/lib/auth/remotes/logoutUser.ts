import { command } from '$app/server';
import { auth } from '$lib/server/auth';

export const logoutUser = command(async () => {
	await auth.api.signOut();
});
