import type { PageServerLoad } from './$types';
import { logoutUser } from '$lib/auth.remote';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	await logoutUser();
	redirect(302, '/auth/login');
};
