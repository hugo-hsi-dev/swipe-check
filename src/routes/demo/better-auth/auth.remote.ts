import { command, query, form } from '$app/server';
import { getRequestEvent } from '$app/server';
import { redirect, isRedirect, invalid } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

const signInSchema = z.object({
	email: z.string().email(),
	_password: z.string().min(1)
});

const signUpSchema = z.object({
	email: z.string().email(),
	_password: z.string().min(1),
	name: z.string().min(1)
});

const socialSchema = z.object({
	provider: z.enum(['github']),
	callbackURL: z.string().optional()
});

export const signOut = command(async () => {
	try {
		await auth.api.signOut({ headers: {} });
		return redirect(302, '/demo/better-auth/login');
	} catch (error) {
		if (isRedirect(error)) throw error;
		throw error;
	}
});

export const getCurrentUser = query(async () => {
	const event = getRequestEvent();
	return event?.locals.user ?? null;
});

export const requireUser = query(async () => {
	const event = getRequestEvent();
	const user = event?.locals.user ?? null;
	if (!user) {
		return redirect(302, '/demo/better-auth/login');
	}
	return user;
});

export const signInEmail = form(signInSchema, async ({ email, _password }, issue) => {
	try {
		await auth.api.signInEmail({
			body: {
				email,
				password: _password,
				callbackURL: '/auth/verification-success'
			}
		});
		return redirect(303, '/demo/better-auth');
	} catch (error) {
		if (isRedirect(error)) throw error;

		if (error instanceof APIError) {
			const code = error.body?.code;
			if (code === 'INVALID_EMAIL') {
				return invalid(issue.email('Invalid email format'));
			}
			if (code === 'INVALID_EMAIL_OR_PASSWORD') {
				return invalid(issue._password('Invalid email or password'));
			}
			return invalid({ message: error.message || 'Sign in failed' });
		}
		throw error;
	}
});

export const signUpEmail = form(signUpSchema, async ({ email, _password, name }, issue) => {
	try {
		await auth.api.signUpEmail({
			body: {
				email,
				password: _password,
				name,
				callbackURL: '/auth/verification-success'
			}
		});
		return redirect(303, '/demo/better-auth');
	} catch (error) {
		if (isRedirect(error)) throw error;

		if (error instanceof APIError) {
			const code = error.body?.code;
			if (code === 'INVALID_EMAIL') {
				return invalid(issue.email('Invalid email format'));
			}
			if (code === 'INVALID_PASSWORD') {
				return invalid(issue._password('Password is required'));
			}
			if (code === 'PASSWORD_TOO_SHORT') {
				return invalid(issue._password('Password is too short'));
			}
			if (code === 'PASSWORD_TOO_LONG') {
				return invalid(issue._password('Password is too long'));
			}
			if (code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
				return invalid(issue.email('Email already registered'));
			}
			return invalid({ message: error.message || 'Registration failed' });
		}
		throw error;
	}
});

export const signInSocial = command(socialSchema, async ({ provider, callbackURL }) => {
	try {
		const result = await auth.api.signInSocial({
			body: {
				provider,
				callbackURL: callbackURL ?? '/demo/better-auth'
			}
		});
		return result.url;
	} catch (error) {
		if (isRedirect(error)) throw error;
		throw error;
	}
});
