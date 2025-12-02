import type { LayoutServerLoad } from './$types';
import { getCurrentUser } from '$lib/auth.remote';

export const load: LayoutServerLoad = async () => {
	const currentUser = await getCurrentUser();

	return {
		currentUser
	};
};
