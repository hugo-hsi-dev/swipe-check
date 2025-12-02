import { query, form, command, getRequestEvent } from '$app/server';
import { invalid, redirect, isRedirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { auth } from './auth';
import { APIError, BetterAuthError } from 'better-auth';

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
			// Re-throw redirect errors
			if (isRedirect(error)) {
				throw error;
			}

			// Handle Better Auth errors with proper typing
			if (error instanceof APIError) {
				if (error.status === 409) {
					// HTTP 409 Conflict is the standard status for "already exists"
					invalid(issue.email('Email already exists'));
				} else {
					invalid(issue.email(`Registration failed: ${error.message}`));
				}
			} else if (error instanceof BetterAuthError) {
				invalid(issue.email(`Registration failed: ${error.message}`));
			} else {
				// Handle unknown errors
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				invalid(issue.email(`Registration failed: ${errorMessage}`));
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
			// Re-throw redirect errors
			if (isRedirect(error)) {
				throw error;
			}

			// Handle Better Auth errors with proper typing
			if (error instanceof APIError) {
			if (error.message === auth.$ERROR_CODES.INVALID_EMAIL) {
			invalid(issue.email(''))
			}
				if (error.status === 401) {
					// HTTP 401 Unauthorized for invalid credentials
					invalid(issue.email('Invalid email or password'));
				} else if (error.status === 404) {
					// HTTP 404 for user not found
					invalid(issue.email('Invalid email or password'));
				} else {
					invalid(issue.email(`Login failed: ${error.message}`));
				}
			} else if (error instanceof BetterAuthError) {
				invalid(issue.email(`Login failed: ${error.message}`));
			} else {
				// Handle unknown errors - but don't expose too much information for security
				invalid(issue.email('Invalid email or password'));
			}
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
