import { fail, redirect } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';
import { loginSchema } from '$lib/validation';
import { safeParse, flatten } from 'valibot';
import type { RequestEvent } from '@sveltejs/kit';

type FieldErrors = {
	email?: string;
	password?: string;
	form?: string;
	data?: {
		email?: string;
	};
};

export const actions = {
	default: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		const result = safeParse(loginSchema, { email, password });

		if (!result.success) {
			const errors = flatten(result.issues).nested || {};
			const fieldErrors: FieldErrors = {};
			if (errors.email) fieldErrors.email = errors.email[0];
			if (errors.password) fieldErrors.password = errors.password[0];

			return fail(400, {
				errors: fieldErrors,
				data: { email: email?.toString() || '' }
			});
		}

		const authResult = await authService.login(result.output.email, result.output.password);

		if (!authResult.success) {
			return fail(400, {
				errors: { form: authResult.error },
				data: { email: result.output.email }
			});
		}

		const { token, session } = authResult.data;
		authService.setSessionCookie(event, token, session.expiresAt);

		throw redirect(303, '/');
	}
};
