import { query } from '$app/server';
import { error } from '@sveltejs/kit';
import { getCurrentUser } from './getCurrentUser.remote';

export const getValidatedUser = query(async () => {
	const user = await getCurrentUser();
	if (!user) {
		// [TODO] Add friendlier messaging
		return error(401, 'Authentication required: No valid user session found');
	}
	return user;
});
