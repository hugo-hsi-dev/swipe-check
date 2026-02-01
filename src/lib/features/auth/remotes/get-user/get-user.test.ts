import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'better-auth';
import getUserHandler from './get-user.handler';
import { getRequestEvent } from '$app/server';

vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn()
}));

describe('getUserHandler', () => {
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

	it('should return user from locals when user exists', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: {
				user: mockUser
			}
		} as any);

		const result = await getUserHandler();

		expect(result).toEqual(mockUser);
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});

	it('should return null when locals.user does not exist', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: {}
		} as any);

		const result = await getUserHandler();

		expect(result).toBeNull();
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});

	it('should return null when locals is undefined', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({} as any);

		const result = await getUserHandler();

		expect(result).toBeNull();
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});
});
