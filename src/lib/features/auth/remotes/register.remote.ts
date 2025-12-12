import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server';
import { auth } from '$lib/server/auth';
import { invalid, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import z from 'zod';
import type { Session, User } from '../types';

// [TODO] Make messaging friendlier
const schema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		email: z.email('Invalid email address'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(128, 'Password must be less than 128 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		error: 'Passwords must match'
	});

export const register = form(schema, async (data, issue) => {
	try {
		const { user, token } = await auth.api.signUpEmail({
			body: {
				name: data.name,
				email: data.email,
				password: data.password
			}
		});

		const event = getRequestEvent();

		if (token) {
			const session = await db.query.session.findFirst({
				where: (table, { eq }) => eq(table.token, token)
			});

			if (!session) {
				throw new Error('Session not found');
			}

			event.locals.session = session as Session;
		}

		event.locals.user = user as User;

		redirect(303, '/auth/login');
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}

		if (!(error instanceof APIError)) {
			console.error(error);
			throw error;
		}

		if (error.message === auth.$ERROR_CODES.INVALID_EMAIL) {
			invalid(issue.email(auth.$ERROR_CODES.INVALID_EMAIL));
		}

		if (error.message === auth.$ERROR_CODES.PASSWORD_TOO_SHORT) {
			invalid(issue.password(auth.$ERROR_CODES.PASSWORD_TOO_SHORT));
		}

		if (error.message === auth.$ERROR_CODES.PASSWORD_TOO_LONG) {
			invalid(issue.password(auth.$ERROR_CODES.PASSWORD_TOO_LONG));
		}

		if (error.message === auth.$ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL) {
			invalid(issue.email(auth.$ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL));
		}
		console.error(error);
		throw error;
	}
});
