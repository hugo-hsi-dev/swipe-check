import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/password';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';

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

function validateEmail(email: string): string | null {
	if (!email || !email.trim()) {
		return 'Email is required';
	}
	// Basic RFC 5322 simplified email regex
	// This allows most common email formats while rejecting obvious invalid formats
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return 'Invalid email address';
	}
	// Additional length check (RFC 5321 specifies max 320 chars)
	if (email.length > 254) {
		return 'Email address is too long';
	}
	return null;
}

function validateUsername(username: string): string | null {
	if (!username || !username.trim()) {
		return 'Username is required';
	}
	if (username.length < 3 || username.length > 20) {
		return 'Username must be between 3 and 20 characters';
	}
	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return 'Username can only contain letters, numbers, and underscores';
	}
	return null;
}

function validatePassword(password: string): string | null {
	if (!password) {
		return 'Password is required';
	}
	if (password.length < 8) {
		return 'Password must be at least 8 characters';
	}
	if (!/[A-Z]/.test(password)) {
		return 'Password must contain an uppercase letter';
	}
	if (!/[a-z]/.test(password)) {
		return 'Password must contain a lowercase letter';
	}
	if (!/[0-9]/.test(password)) {
		return 'Password must contain a number';
	}
	return null;
}

export const actions = {
	default: async (event) => {
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
			// Normalize email to lowercase for case-insensitive comparison
			const normalizedEmail = email.toLowerCase();

			// Check email uniqueness (case-insensitive)
			const existingEmail = await db
				.select()
				.from(table.user)
				.where(eq(table.user.email, normalizedEmail))
				.limit(1);

			if (existingEmail.length > 0) {
				return fail(400, { errors: { email: 'Email already registered' } });
			}

			// Normalize username to lowercase for case-insensitive comparison
			const normalizedUsername = username.toLowerCase();

			// Check username uniqueness (case-insensitive)
			const existingUsername = await db
				.select()
				.from(table.user)
				.where(eq(table.user.username, normalizedUsername))
				.limit(1);

			if (existingUsername.length > 0) {
				return fail(400, { errors: { username: 'Username already taken' } });
			}

			// Hash password
			const passwordHash = await hashPassword(password);

			// Create user
			const bytes = crypto.getRandomValues(new Uint8Array(12));
			const userId = encodeBase64url(bytes);
			await db.insert(table.user).values({
				id: userId,
				email: normalizedEmail,
				username: normalizedUsername,
				passwordHash
			});

			// Create session and set cookie
			const token = generateSessionToken();
			await createSession(token, userId);
			setSessionTokenCookie(event, token, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

			// Redirect to home
			throw redirect(303, '/');
		} catch (error) {
			console.error('Signup error:', error);

			// Handle unique constraint violations (race condition fallback)
			const errorMessage = error instanceof Error ? error.message : '';
			if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
				return fail(400, {
					errors: { form: 'This email or username is already registered. Please try another.' }
				});
			}

			return fail(500, {
				errors: { form: 'An error occurred during signup. Please try again.' }
			});
		}
	}
};
