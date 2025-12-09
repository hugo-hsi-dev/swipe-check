import type { PageServerLoad } from './$types';
import { getCurrentUser } from '$lib/auth/remotes/getCurrentUser';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const currentUser = await getCurrentUser();

	if (currentUser) {
		redirect(302, '/dashboard');
	}

	return {
		currentUser
	};
};
