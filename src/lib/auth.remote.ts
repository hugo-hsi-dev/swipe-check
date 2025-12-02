import { query, form, command, getRequestEvent } from '$app/server';
import { invalid, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { auth } from './server/auth';

// Query for getting current user
export const getCurrentUser = query(async () => {
	const session = await auth.api.getSession({
		headers: getRequestEvent().request.headers
	});

	return session?.user || null;
});

// Form for user registration
export const registerUser = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		email: v.pipe(v.string(), v.email()),
		password: v.pipe(v.string(), v.minLength(8)),
		confirmPassword: v.string()
	}),
	async (data, issue) => {
		// Programmatic confirmPassword validation
		if (data.password !== data.confirmPassword) {
			invalid(issue.confirmPassword('Passwords must match'));
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name: data.name,
					email: data.email,
					password: data.password
				}
			});

			redirect(303, '/auth/login');
		} catch (error) {
			// Handle Better Auth errors - check if it's an email already exists error
			if (error instanceof Error && error.message.includes('already exists')) {
				invalid(issue.email('Email already exists'));
			} else {
				invalid(issue.email('Registration failed'));
			}
		}
	}
);

// Form for user login
export const loginUser = form(
	v.object({
		email: v.pipe(v.string(), v.email()),
		password: v.string()
	}),
	async (data, issue) => {
		try {
			await auth.api.signInEmail({
				body: {
					email: data.email,
					password: data.password
				}
			});

			redirect(303, '/dashboard');
		} catch (error) {
			invalid(issue.email('Invalid email or password'));
		}
	}
);

// Command for logout
export const logoutUser = command(async () => {
	await auth.api.signOut({
		headers: getRequestEvent().request.headers
	});

	return { success: true };
});
