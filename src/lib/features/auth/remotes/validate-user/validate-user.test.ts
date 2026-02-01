import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'better-auth';
import validateUserHandler from './validate-user.handler';

const mockGetUser = vi.fn();

vi.mock('$lib/features/auth/remotes/get-user/get-user.remote', () => ({
	getUser: () => mockGetUser()
}));

vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		const err = new Error(message);
		(err as any).status = status;
		throw err;
	})
}));

describe('validateUserHandler', () => {
	const mockUser: User = {
		id: 'user-123',
		email: 'test@example.com',
		name: 'Test User',
		image: null,
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date()
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
