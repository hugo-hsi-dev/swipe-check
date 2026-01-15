import type { RequestEvent } from '@sveltejs/kit';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth';
import { verifyPassword } from '$lib/server/password';

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
		const email = (formData.get('email') as string)?.trim() || '';
		const password = (formData.get('password') as string) || '';

		const errors: FieldErrors = {};

		if (!email) {
			errors.email = 'Email is required';
		}
		if (!password) {
			errors.password = 'Password is required';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, data: { email } });
		}

		try {
			const user = await AuthService.findUserByEmail(email);

			if (!user) {
				return fail(400, {
					errors: { form: 'Invalid email or password' },
					data: { email }
				});
			}

			const validPassword = await verifyPassword(user.passwordHash, password);

			if (!validPassword) {
				return fail(400, {
					errors: { form: 'Invalid email or password' },
					data: { email }
				});
			}

			const token = AuthService.session.generateToken();
			await AuthService.session.create(token, user.id);
			AuthService.session.setCookie(event, token, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

			throw redirect(303, '/');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			console.error('Login error:', error);
			return fail(500, {
				errors: { form: 'An error occurred during login. Please try again.' },
				data: { email }
			});
		}
	}
};
