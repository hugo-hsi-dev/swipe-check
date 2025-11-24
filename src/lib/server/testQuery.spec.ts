import { describe, it, expect } from 'vitest';
import { getTestNumber, echoMessage, getUserInfo } from './testQuery';

describe('Server Query Functions', () => {
	it('should return test number 42', async () => {
		const result = await getTestNumber();
		expect(result).toBe(42);
	});

	it('should echo the input message', async () => {
		const testMessage = 'Hello, world!';
		const result = await echoMessage(testMessage);
		expect(result).toBe(testMessage);
	});

	it('should return user info for a given ID', async () => {
		const userId = 123;
		const result = await getUserInfo(userId);

		expect(result.id).toBe(userId);
		expect(result.name).toBe(`User ${userId}`);
		expect(result.email).toBe(`user${userId}@example.com`);
	});

	it('should handle different user IDs correctly', async () => {
		const userId1 = 1;
		const userId2 = 2;

		const result1 = await getUserInfo(userId1);
		const result2 = await getUserInfo(userId2);

		expect(result1.id).toBe(userId1);
		expect(result2.id).toBe(userId2);
		expect(result1.name).not.toBe(result2.name);
		expect(result1.email).not.toBe(result2.email);
	});
});
