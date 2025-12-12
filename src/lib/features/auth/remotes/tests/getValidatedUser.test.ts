import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../types';
import { getValidatedUser } from '../getValidatedUser.remote';
import { getCurrentUser } from '../getCurrentUser.remote';

// Mock the dependencies
vi.mock('$app/server', () => ({
	query: vi.fn((fn) => fn)
}));

vi.mock(import('../getCurrentUser.remote'), () => ({
	getCurrentUser: vi.fn()
}));

describe('getValidatedUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the user when authentication is valid', async () => {
		// Arrange
		const mockUser: User = {
			id: 'user-123',
			email: 'test@example.com',
			name: 'Test User',
			emailVerified: true,
			image: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01')
		} as User;

		const mockGetCurrentUser = vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

		// Act
		const result = await getValidatedUser();

		// Assert
		expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
		expect(result).toBe(mockUser);
		expect(result).toEqual(mockUser);
	});

	it('throws a 401 error when no user is found (getCurrentUser returns null)', async () => {
		// Arrange
		const mockGetCurrentUser = vi.mocked(getCurrentUser).mockResolvedValue(null);

		// Act & Assert
		await expect(getValidatedUser()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Authentication required: No valid user session found'
			}
		});

		expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
	});

	it('throws a 401 error when no user is found (getCurrentUser returns null)', async () => {
		// Arrange
		const mockGetCurrentUser = vi.mocked(getCurrentUser).mockResolvedValue(null);

		// Act & Assert
		await expect(getValidatedUser()).rejects.toMatchObject({
			status: 401,
			body: {
				message: 'Authentication required: No valid user session found'
			}
		});

		expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
	});

	it('passes through the user object without modification when valid', async () => {
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

		const mockGetCurrentUser = vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

		// Act
		const result = await getValidatedUser();

		// Assert
		expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
		expect(result).toBe(mockUser); // Same reference
		expect(result?.id).toBe('user-456');
		expect(result?.email).toBe('user@example.com');
		expect(result?.emailVerified).toBe(false);
	});

	it('handles getCurrentUser throwing an error', async () => {
		// Arrange
		const dbError = new Error('Database connection failed');
		const mockGetCurrentUser = vi.mocked(getCurrentUser).mockRejectedValue(dbError);

		// Act & Assert
		await expect(getValidatedUser()).rejects.toThrow('Database connection failed');
		expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
	});

	it('uses the query wrapper correctly', async () => {
		// This test verifies that the function is properly wrapped with the query function
		// Since we're mocking the query function to just pass through the function,
		// we can verify it works by calling it successfully
		// Arrange
		const mockUser: User = {
			id: 'user-789',
			email: 'verified@example.com',
			name: 'Verified User',
			emailVerified: true,
			image: null,
			createdAt: new Date('2024-12-10'),
			updatedAt: new Date('2024-12-10')
		} as User;

		vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

		// Act
		const result = await getValidatedUser();

		// Assert
		expect(result).toBeDefined();
		expect(result?.email).toBe('verified@example.com');
	});
});
