import type { RequestEvent } from '@sveltejs/kit';
import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth';
import { hashPassword } from '$lib/server/password';
import { validateEmail, validateUsername, validatePassword } from '$lib/server/validation';

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
		const email = (formData.get('email') as string)?.trim() || '';
		const username = (formData.get('username') as string)?.trim() || '';
		const password = (formData.get('password') as string) || '';
		const passwordConfirmation = (formData.get('passwordConfirmation') as string) || '';

		// Validate fields
		const errors: FieldErrors = {};

		const emailError = validateEmail(email);
		if (emailError) {
			errors.email = emailError;
		}

		const usernameError = validateUsername(username);
		if (usernameError) {
			errors.username = usernameError;
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			errors.password = passwordError;
		}

		// Check password confirmation matches
		if (!passwordConfirmation) {
			errors.passwordConfirmation = 'Please confirm your password';
		} else if (password !== passwordConfirmation) {
			errors.passwordConfirmation = 'Passwords do not match';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, data: { email, username } });
		}

		try {
			// Check email uniqueness
			const existingUserByEmail = await AuthService.findUserByEmail(email);
			if (existingUserByEmail) {
				const errors: FieldErrors = { email: 'Email already registered' };
				return fail(400, { errors, data: { email, username } });
			}

			// Hash password
			const passwordHash = await hashPassword(password);

			// Create user
			const user = await AuthService.createUser({
				email,
				username,
				passwordHash
			});

			// Create session and set cookie
			const token = AuthService.session.generateToken();
			await AuthService.session.create(token, user.id);
			AuthService.session.setCookie(event, token, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

			// Redirect to home
			throw redirect(303, '/');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
			console.error('Registration error:', error);

			// Handle unique constraint violations (race condition fallback)
			const errorMessage = error instanceof Error ? error.message : '';
			if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
				const errors: FieldErrors = {
					form: 'This email or username is already registered. Please try another.'
				};
				return fail(400, { errors, data: { email, username } });
			}

			const errors: FieldErrors = {
				form: 'An error occurred during registration. Please try again.'
			};
			return fail(500, { errors, data: { email, username } });
		}
	}
};
