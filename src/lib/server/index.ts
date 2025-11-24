// Server-side exports for remote functions and utilities
export * from './db';

// These functions will be used as examples for remote functions
export async function getTestNumber(): Promise<number> {
	return 42;
}

export async function echoMessage(message: string): Promise<string> {
	return message;
}

export async function getUserInfo(
	userId: number
): Promise<{ id: number; name: string; email: string; createdAt: string }> {
	// Simulate database delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		id: userId,
		name: `User ${userId}`,
		email: `user${userId}@example.com`,
		createdAt: new Date().toISOString()
	};
}
