import type { User } from 'better-auth';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import validateUserHandler from './validate-user.handler';

const mockGetUser = vi.fn();

vi.mock('$lib/features/auth/remotes/get-user/get-user.remote', () => ({
	getUser: () => mockGetUser()
}));

interface HttpError extends Error {
	status: number;
}

vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		const err = new Error(message) as HttpError;
		err.status = status;
		throw err;
	})
}));

describe('validateUserHandler', () => {
	const mockUser: User = {
		email: 'test@example.com',
		createdAt: new Date(),
		updatedAt: new Date(),
		emailVerified: true,
		name: 'Test User',
		id: 'user-123',
		image: null
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return user when user exists', async () => {
		mockGetUser.mockResolvedValue(mockUser);

		const result = await validateUserHandler();

		expect(result).toEqual(mockUser);
		expect(mockGetUser).toHaveBeenCalledOnce();
	});

	it('should throw 401 error when user does not exist', async () => {
		mockGetUser.mockResolvedValue(null);

		await expect(validateUserHandler()).rejects.toThrow('Unauthorized');
		expect(mockGetUser).toHaveBeenCalledOnce();
	});
});
