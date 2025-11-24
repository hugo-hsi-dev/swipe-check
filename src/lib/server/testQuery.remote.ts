import { query, command, form } from '$app/server';
import * as v from 'valibot';

// Simple query that returns a number
export const getTestNumber = query(async () => {
	return 42;
});

// Query with parameters that echoes the input
export const echoMessage = query(v.string(), async (message: string) => {
	return message;
});

// Query with validation that simulates a database operation
export const getUserData = query(v.number(), async (userId: number) => {
	// Simulate database delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		id: userId,
		name: `User ${userId}`,
		email: `user${userId}@example.com`
	};
});

// Command to update user status
export const updateUserStatus = command(
	v.object({
		userId: v.number(),
		status: v.picklist(['active', 'inactive'])
	}),
	async ({ userId, status }) => {
		// Simulate database update
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			success: true,
			userId,
			status,
			updatedAt: new Date().toISOString()
		};
	}
);

// Form to create a new user
export const createUserForm = form(
	v.object({
		name: v.pipe(v.string(), v.nonEmpty()),
		email: v.pipe(v.string(), v.email())
	}),
	async ({ name, email }) => {
		// Simulate creating a user in the database
		await new Promise((resolve) => setTimeout(resolve, 100));

		return {
			id: Math.floor(Math.random() * 1000),
			name,
			email,
			createdAt: new Date().toISOString()
		};
	}
);
