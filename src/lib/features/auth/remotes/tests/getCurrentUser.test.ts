import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../types';
import { getCurrentUser } from '../getCurrentUser.remote';
import { getRequestEvent } from '$app/server';

// Mock the SKit server module
vi.mock('$app/server', () => ({
	getRequestEvent: vi.fn(),
	query: vi.fn((fn) => fn)
}));

describe('getCurrentUser', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('returns user when user is present in event.locals', async () => {
		// Arrange
		const mockUser = {
			id: 'user-123',
			email: 'test@example.com',
			name: 'Test User',
			emailVerified: true,
			image: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01')
		} as User;

		const mockEvent = {
			locals: {
				user: mockUser
			}
		} as ReturnType<typeof getRequestEvent>;

		const mockGetRequestEvent = vi.mocked(getRequestEvent).mockReturnValue(mockEvent);

		// Act
		const result = await getCurrentUser();

		// Assert
		expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
		expect(result).toBe(mockUser);
		expect(result).toEqual(mockUser);
	});

	it('returns undefined when user is not present in event.locals', async () => {
		// Arrange
		const mockEvent = {
			locals: {
				user: null
			}
		} as ReturnType<typeof getRequestEvent>;

		const mockGetRequestEvent = vi.mocked(getRequestEvent).mockReturnValue(mockEvent);

		// Act
		const result = await getCurrentUser();

		// Assert
		expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});

	it('returns null when user is null in event.locals', async () => {
		// Arrange
		const mockEvent = {
			locals: {
				user: null
			}
		} as ReturnType<typeof getRequestEvent>;

		const mockGetRequestEvent = vi.mocked(getRequestEvent).mockReturnValue(mockEvent);

		// Act
		const result = await getCurrentUser();

		// Assert
		expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});

	it('handles empty locals object', async () => {
		// Arrange
		const mockEvent = {
			locals: {}
		} as ReturnType<typeof getRequestEvent>;

		const mockGetRequestEvent = vi.mocked(getRequestEvent).mockReturnValue(mockEvent);

		// Act
		const result = await getCurrentUser();

		// Assert
		expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it('returns user with all required properties', async () => {
		// Arrange
		const mockUser: User = {
			id: 'user-456',
			email: 'user@example.com',
			name: 'Example User',
			emailVerified: false,
			image: 'https://example.com/avatar.jpg',
			createdAt: new Date('2024-06-15T10:30:00Z'),
			updatedAt: new Date('2024-06-20T14:45:00Z')
		} as User;

		const mockEvent = {
			locals: {
				user: mockUser
			}
		} as ReturnType<typeof getRequestEvent>;

		const mockGetRequestEvent = vi.mocked(getRequestEvent).mockReturnValue(mockEvent);

		// Act
		const result = await getCurrentUser();

		// Assert
		expect(mockGetRequestEvent).toHaveBeenCalledTimes(1);
		expect(result).toBeDefined();
		expect(result?.id).toBe('user-456');
		expect(result?.email).toBe('user@example.com');
		expect(result?.name).toBe('Example User');
		expect(result?.emailVerified).toBe(false);
		expect(result?.image).toBe('https://example.com/avatar.jpg');
		expect(result?.createdAt).toEqual(new Date('2024-06-15T10:30:00Z'));
		expect(result?.updatedAt).toEqual(new Date('2024-06-20T14:45:00Z'));
	});
});
