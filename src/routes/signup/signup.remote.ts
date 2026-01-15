import * as v from 'valibot';
import { form, getRequestEvent } from '$app/server';
import { redirect, invalid, isRedirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/password';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';

// Valibot schema for signup form
const signupSchema = v.object({
	email: v.pipe(
		v.string('Email is required'),
		v.trim(),
		v.nonEmpty('Email is required'),
		v.email('Please enter a valid email address'),
		v.maxLength(254, 'Email must be less than 254 characters')
	),
	username: v.pipe(
		v.string('Username is required'),
		v.trim(),
		v.nonEmpty('Username is required'),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(20, 'Username must be less than 20 characters'),
		v.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	),
	password: v.pipe(
		v.string('Password is required'),
		v.nonEmpty('Password is required'),
		v.minLength(8, 'Password must be at least 8 characters'),
		v.maxLength(72, 'Password must be less than 72 characters'),
		v.regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
		v.regex(/[a-z]/, 'Password must contain at least one lowercase letter'),
		v.regex(/[0-9]/, 'Password must contain at least one number')
	),
	passwordConfirmation: v.pipe(
		v.string('Please confirm your password'),
		v.nonEmpty('Please confirm your password')
	)
});

export const signup = form(signupSchema, async (data, issue) => {
	// Custom validation: Check if passwords match
	if (data.password !== data.passwordConfirmation) {
		throw invalid(issue.passwordConfirmation('Passwords do not match'));
	}

	// Normalize email and username to lowercase
	const normalizedEmail = data.email.toLowerCase();
	const normalizedUsername = data.username.toLowerCase();

	// Check for duplicate email
	const existingEmail = await db
		.select()
		.from(table.user)
		.where(eq(table.user.email, normalizedEmail))
		.limit(1);

	if (existingEmail.length > 0) {
		throw invalid(issue.email('Email already registered'));
	}

	// Check for duplicate username
	const existingUsername = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, normalizedUsername))
		.limit(1);

	if (existingUsername.length > 0) {
		throw invalid(issue.username('Username already taken'));
	}

	try {
		// Hash password
		const passwordHash = await hashPassword(data.password);

		// Generate user ID
		const bytes = crypto.getRandomValues(new Uint8Array(12));
		const userId = encodeBase64url(bytes);

		// Create user
		await db.insert(table.user).values({
			id: userId,
			email: normalizedEmail,
			username: normalizedUsername,
			passwordHash
		});

		// Create session and set cookie
		const event = getRequestEvent();
		const token = generateSessionToken();
		await createSession(token, userId);
		setSessionTokenCookie(event, token, new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));

		// Redirect to home
		throw redirect(303, '/');
	} catch (error) {
		// Re-throw redirect errors (they're not actual errors)
		if (isRedirect(error)) {
			throw error;
		}

		console.error('Signup error:', error);

		// Handle unique constraint violations (race condition fallback)
		const errorMessage = error instanceof Error ? error.message : '';
		if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
			throw invalid('This email or username is already registered. Please try another.');
		}

		throw invalid('An error occurred during signup. Please try again.');
	}
});
