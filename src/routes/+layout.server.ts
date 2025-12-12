import type { LayoutServerLoad } from './$types';
import { getCurrentUser } from '$lib/features/auth/remotes/getCurrentUser.remote';

export const load: LayoutServerLoad = async () => {
	const currentUser = await getCurrentUser();

	return {
		currentUser
	};
};
