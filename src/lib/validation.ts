import { email, minLength, object, string, maxLength, pipe, regex } from 'valibot';

export const loginSchema = object({
	email: pipe(
		string('Email is required'),
		minLength(1, 'Email is required'),
		email('Invalid email address'),
		maxLength(254, 'Email address is too long')
	),
	password: pipe(string('Password is required'), minLength(1, 'Password is required'))
});

export const registerSchema = object({
	email: pipe(
		string('Email is required'),
		minLength(1, 'Email is required'),
		email('Invalid email address'),
		maxLength(254, 'Email address is too long')
	),
	username: pipe(
		string('Username is required'),
		minLength(3, 'Username must be at least 3 characters'),
		maxLength(20, 'Username must be at most 20 characters'),
		regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
	),
	password: pipe(
		string('Password is required'),
		minLength(8, 'Password must be at least 8 characters'),
		regex(/[A-Z]/, 'Password must contain an uppercase letter'),
		regex(/[a-z]/, 'Password must contain a lowercase letter'),
		regex(/[0-9]/, 'Password must contain a number')
	)
});

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;
