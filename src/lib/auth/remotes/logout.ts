import { command } from '$app/server';
import { auth } from '$lib/server/auth';

export const logout = command(async () => {
	await auth.api.signOut();
});
