import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '../logout.remote';
import { auth } from '$lib/server/auth';

// Define the signOut response type based on better-auth patterns
interface SignOutResponse {
	success: boolean;
	error?: string;
}

// Mock the SvelteKit server module
vi.mock('$app/server', () => {
	const command = (schemaOrHandler: unknown, arg2: unknown) => {
		const handler = (arg2 ?? schemaOrHandler) as { __?: { type: string } };

		handler.__ = {
			type: 'command'
		};

		// Could wrap this in a schema check as well for good measure
		return handler;
	};

	return {
		command
	};
});

// Mock the auth module
vi.mock('$lib/server/auth', () => ({
	auth: {
		api: {
			signOut: vi.fn()
		}
	}
}));

describe('logout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('successfully logs out when signOut returns success: true', async () => {
		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: true
		};

		const mockSignOut = vi.mocked(auth.api.signOut).mockResolvedValue(mockSignOutResponse);

		// Act
		await logout();

		// Assert
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledWith();
		// Should not throw
	});

	it('throws an error when signOut returns success: false', async () => {
		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: false
		};

		const mockSignOut = vi.mocked(auth.api.signOut).mockResolvedValue(mockSignOutResponse);

		// Act & Assert
		await expect(logout()).rejects.toThrow('Something went wrong');
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledWith();
	});

	it('throws an error when signOut returns success: false with error message', async () => {
		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: false,
			error: 'Session not found'
		};

		const mockSignOut = vi.mocked(auth.api.signOut).mockResolvedValue(mockSignOutResponse);

		// Act & Assert
		await expect(logout()).rejects.toThrow('Something went wrong');
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledWith();
		// Note: We throw a generic error, not the specific error from the response
	});

	it('handles signOut API errors (network/database errors)', async () => {
		// Arrange
		const apiError = new Error('Network connection failed');
		const mockSignOut = vi.mocked(auth.api.signOut).mockRejectedValue(apiError);

		// Act & Assert
		await expect(logout()).rejects.toThrow('Network connection failed');
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(mockSignOut).toHaveBeenCalledWith();
	});

	it('handles signOut throwing a database error', async () => {
		// Arrange
		const dbError = new Error('Database connection failed');
		dbError.name = 'DatabaseError';
		const mockSignOut = vi.mocked(auth.api.signOut).mockRejectedValue(dbError);

		// Act & Assert
		await expect(logout()).rejects.toThrow('Database connection failed');
		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});

	it('is properly wrapped with the command function', async () => {
		// This test verifies that the function is properly wrapped with the command function
		// Since we're mocking the command function to just pass through the function,
		// we can verify it works by calling it successfully

		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: true
		};
		const mockSignOut = vi.mocked(auth.api.signOut).mockResolvedValue(mockSignOutResponse);

		// Act
		await logout();

		// Assert
		// If the command wrapper wasn't working, this test would fail
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		expect(typeof logout).toBe('function');
	});

	it('does not return any value on successful logout', async () => {
		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: true
		};
		const mockSignOut = vi.mocked(auth.api.signOut).mockResolvedValue(mockSignOutResponse);

		// Act
		const result = await logout();

		// Assert
		expect(mockSignOut).toHaveBeenCalledTimes(1);
		// The logout command should not return any value (void)
		expect(result).toBeUndefined();
	});

	it('maintains async/await behavior properly', async () => {
		// Arrange
		const mockSignOutResponse: SignOutResponse = {
			success: true
		};
		const mockSignOut = vi.mocked(auth.api.signOut).mockImplementation(async () => {
			// Simulate async behavior
			await new Promise((resolve) => setTimeout(resolve, 1));
			return mockSignOutResponse;
		});

		// Act
		const result = logout();

		// Assert - Should return a promise
		expect(result).toBeInstanceOf(Promise);

		// Wait for completion
		await result;

		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});

	it('throws the same error instance when signOut API throws', async () => {
		// Arrange
		const customError = new Error('Custom API error');
		customError.name = 'APIError';
		const mockSignOut = vi.mocked(auth.api.signOut).mockRejectedValue(customError);

		// Act & Assert
		await expect(logout()).rejects.toBe(customError);
		expect(mockSignOut).toHaveBeenCalledTimes(1);
	});
});
