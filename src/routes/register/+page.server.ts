import type { RequestEvent } from '@sveltejs/kit';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';
import { registerSchema } from '$lib/validation';
import { safeParse, flatten } from 'valibot';

type FieldErrors = {
	email?: string;
	username?: string;
	password?: string;
	passwordConfirmation?: string;
	form?: string;
	data?: {
		email?: string;
		username?: string;
	};
};

export const actions = {
	default: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const username = formData.get('username');
		const password = formData.get('password');
		const passwordConfirmation = formData.get('passwordConfirmation');

		const result = safeParse(registerSchema, { email, username, password });

		if (!result.success) {
			const errors = flatten(result.issues).nested || {};
			const fieldErrors: FieldErrors = {};

			if (errors.email) fieldErrors.email = errors.email[0];
			if (errors.username) fieldErrors.username = errors.username[0];
			if (errors.password) fieldErrors.password = errors.password[0];

			if (!passwordConfirmation) {
				fieldErrors.passwordConfirmation = 'Please confirm your password';
			} else if (password !== passwordConfirmation) {
				fieldErrors.passwordConfirmation = 'Passwords do not match';
			}

			return fail(400, {
				errors: fieldErrors,
				data: {
					email: email?.toString() || '',
					username: username?.toString() || ''
				}
			});
		}

		if (password !== passwordConfirmation) {
			return fail(400, {
				errors: { passwordConfirmation: 'Passwords do not match' },
				data: {
					email: result.output.email,
					username: result.output.username
				}
			});
		}

		try {
			const registerResult = await authService.register({
				email: result.output.email,
				username: result.output.username,
				password: result.output.password
			});

			if (!registerResult.success) {
				const errorMsg = registerResult.error;
				const fieldErrors: FieldErrors = {};

				if (errorMsg.includes('Email')) fieldErrors.email = errorMsg;
				else if (errorMsg.includes('Username')) fieldErrors.username = errorMsg;
				else fieldErrors.form = errorMsg;

				return fail(400, {
					errors: fieldErrors,
					data: {
						email: result.output.email,
						username: result.output.username
					}
				});
			}

			const { userId } = registerResult.data;

			const token = authService.generateSessionToken();
			const session = await authService.createSession(token, userId);
			authService.setSessionCookie(event, token, session.expiresAt);

			throw redirect(303, '/');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			console.error('Registration error:', error);

			const errors: FieldErrors = {
				form: 'An error occurred during registration. Please try again.'
			};
			return fail(500, {
				errors,
				data: {
					email: result.output.email,
					username: result.output.username
				}
			});
		}
	}
};
