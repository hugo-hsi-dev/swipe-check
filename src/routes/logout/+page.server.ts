import { redirect } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';

export const actions = {
	default: async (event: RequestEvent) => {
		await authService.logout(event);
		throw redirect(303, '/login');
	}
};
