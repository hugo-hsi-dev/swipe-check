import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	await auth.api.signOut({
		headers: getRequestEvent().request.headers
	});

	redirect(302, '/auth/login');
};
