import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server';
import { auth } from '$lib/server/auth';
import { invalid, isRedirect, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import z from 'zod';
import type { Session, User } from '../types';

const schema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const login = form(schema, async (data, issue) => {
	try {
		const { token, user } = await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password
			}
		});

		const session = await db.query.session.findFirst({
			where: (table, { eq }) => eq(table.token, token)
		});

		if (!session) {
			throw new Error('Session not found');
		}

		const event = getRequestEvent();

		event.locals.user = user as User;
		event.locals.session = session as Session;

		redirect(303, '/dashboard');
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

		if (error.message === auth.$ERROR_CODES.INVALID_EMAIL_OR_PASSWORD) {
			invalid(issue.password(auth.$ERROR_CODES.INVALID_EMAIL_OR_PASSWORD));
		}

		if (error.message === auth.$ERROR_CODES.EMAIL_NOT_VERIFIED) {
			invalid(issue.password(auth.$ERROR_CODES.EMAIL_NOT_VERIFIED));
		}

		throw error;
	}
});
