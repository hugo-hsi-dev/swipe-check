import * as v from 'valibot';
import { redirect, invalid } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCase } from '@oslojs/encoding';

const registerSchema = v.pipe(
	v.object({
		username: v.pipe(
			v.string(),
			v.minLength(3, 'Username must be at least 3 characters'),
			v.maxLength(31, 'Username must be at most 31 characters'),
			v.regex(
				/^[a-z0-9_-]+$/,
				'Username can only contain lowercase letters, numbers, hyphens, and underscores'
			)
		),
		password: v.pipe(
			v.string(),
			v.minLength(6, 'Password must be at least 6 characters'),
			v.maxLength(255, 'Password must be at most 255 characters')
		),
		confirmPassword: v.string()
	}),
	v.forward(
		v.check(
			({ password, confirmPassword }) => password === confirmPassword,
			'Passwords do not match'
		),
		['confirmPassword']
	)
);

export const registerUser = form(
	registerSchema,
	async ({ username, password }: { username: string; password: string }, issue) => {
		// Check if user already exists
		const existingUser = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, username))
			.limit(1);

		if (existingUser.length > 0) {
			// Use invalid function for validation error
			invalid(issue.username('Username already exists'));
		}

		// Generate user ID
		const userId = generateUserId();

		// Hash password
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Create user
		await db.insert(table.user).values({
			id: userId,
			username,
			passwordHash
		});

		// Create session and set cookie
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);

		const event = getRequestEvent();
		if (event) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		}

		// Redirect to dashboard or home
		redirect(302, '/dashboard');
	}
);

const loginSchema = v.object({
	username: v.string(),
	password: v.string()
});

export const loginUser = form(
	loginSchema,
	async ({ username, password }: { username: string; password: string }, issue) => {
		const results = await db.select().from(table.user).where(eq(table.user.username, username));
		const existingUser = results.at(0);

		if (!existingUser) {
			invalid(issue.username('Incorrect username or password'));
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			invalid(issue.username('Incorrect username or password'));
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);

		const event = getRequestEvent();
		if (event) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		}

		redirect(302, '/dashboard');
	}
);

function generateUserId(): string {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
