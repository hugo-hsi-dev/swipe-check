// A simple server function for testing

export async function getTestNumber(): Promise<number> {
	return 42;
}

export async function echoMessage(message: string): Promise<string> {
	return message;
}

export async function getUserInfo(
	userId: number
): Promise<{ id: number; name: string; email: string }> {
	// Simulate database delay
	await new Promise((resolve) => setTimeout(resolve, 100));

	return {
		id: userId,
		name: `User ${userId}`,
		email: `user${userId}@example.com`
	};
}
