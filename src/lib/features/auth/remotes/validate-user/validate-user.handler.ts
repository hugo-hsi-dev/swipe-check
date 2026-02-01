import type { User } from 'better-auth';

import { getUser } from '$lib/features/auth/remotes/get-user/get-user.remote';
import { error } from '@sveltejs/kit';

export default async function validateUserHandler(): Promise<User> {
	const user = await getUser();

	if (!user) {
		error(401, 'Unauthorized');
	}

	return user;
}
