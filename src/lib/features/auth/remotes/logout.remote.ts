import { command } from '$app/server';
import { auth } from '$lib/server/auth';

export const logout = command(async () => {
	const { success } = await auth.api.signOut();

	if (!success) {
		throw new Error('Something went wrong');
	}
});
