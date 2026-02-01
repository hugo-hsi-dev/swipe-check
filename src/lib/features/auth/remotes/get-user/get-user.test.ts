import type { User } from 'better-auth';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRequestEvent } from '$app/server';

import getUserHandler from './get-user.handler';

vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn()
}));

describe('getUserHandler', () => {
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

	it('should return user from locals when user exists', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({
			locals: { user: mockUser }
		} as unknown as ReturnType<typeof getRequestEvent>);

		const result = await getUserHandler();

		expect(result).toEqual(mockUser);
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});

	it('should return null when locals.user does not exist', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({ locals: {} } as unknown as ReturnType<
			typeof getRequestEvent
		>);

		const result = await getUserHandler();

		expect(result).toBeNull();
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});

	it('should return null when locals is undefined', async () => {
		vi.mocked(getRequestEvent).mockReturnValue({ locals: {} } as unknown as ReturnType<
			typeof getRequestEvent
		>);

		const result = await getUserHandler();

		expect(result).toBeNull();
		expect(getRequestEvent).toHaveBeenCalledOnce();
	});
});
