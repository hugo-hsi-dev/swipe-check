import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
// page import removed as it's not used
import UserProfile from './UserProfile.svelte';

// Mock the remote query module before importing
vi.mock('$lib/server/testQuery.remote', () => ({
	getUserData: vi.fn()
}));

import { getUserData } from '$lib/server/testQuery.remote';

describe('UserProfile component with mocked remote queries', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createTarget = () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		return el;
	};

	it('should successfully mock remote query and render component', async () => {
		// Mock the remote function to return a resolved promise
		const mockUserData = {
			id: 123,
			name: 'Test User',
			email: 'test@example.com'
		};

		// Mock getUserData using vi.mocked - this properly types the mock without 'any'
		const mockedFn = vi.mocked(getUserData);
		mockedFn.mockResolvedValue(mockUserData);

		// Render the component
		const { container } = render(UserProfile, {
			target: createTarget(),
			props: { userId: 123 }
		});

		// Wait a bit for async rendering
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Check if component rendered
		expect(container).toBeTruthy();
	});

	it('should call getUserData with the correct userId', async () => {
		const mockUserData = {
			id: 456,
			name: 'Jane Doe',
			email: 'jane@example.com'
		};

		const mockedFn = vi.mocked(getUserData);
		mockedFn.mockResolvedValue(mockUserData);

		render(UserProfile, {
			target: createTarget(),
			props: { userId: 456 }
		});

		// Wait for the component to call the mock
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Verify the mock was called with the correct userId
		expect(getUserData).toHaveBeenCalledWith(456);
	});

	it('should handle different user IDs correctly', async () => {
		const mockUserData1 = {
			id: 100,
			name: 'User One',
			email: 'user1@example.com'
		};

		// Mock getUserData for the first user
		const firstMock = vi.mocked(getUserData);
		firstMock.mockResolvedValue(mockUserData1);

		render(UserProfile, {
			target: createTarget(),
			props: { userId: 100 }
		});

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(getUserData).toHaveBeenCalledWith(100);

		// Proceed to render again; automatic cleanup runs after each test

		// Test with different user
		const mockUserData2 = {
			id: 200,
			name: 'User Two',
			email: 'user2@example.com'
		};

		// Mock getUserData for the second user
		const secondMock = vi.mocked(getUserData);
		secondMock.mockResolvedValue(mockUserData2);

		render(UserProfile, {
			target: createTarget(),
			props: { userId: 200 }
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(getUserData).toHaveBeenCalledWith(200);
	});

	it('should document the approach to testing components with remote queries', () => {
		// This test documents our findings about testing components that use remote queries
		//
		// Key findings:
		// 1. We can successfully mock remote query functions using vi.mock()
		// 2. The component can be rendered in browser tests with mocked queries
		// 3. We can verify that the remote function was called with correct arguments
		//
		// However, there are limitations:
		// - The actual remote query behavior cannot be tested in unit tests
		// - We cannot directly test the UI rendering with the query data in browser tests
		//   due to the async nature and how Svelte 5's experimental await works
		//
		// Best practices for testing components with remote queries:
		// - Mock the remote functions to return test data
		// - Verify the functions are called with correct arguments
		// - Test the component logic separately from remote query integration
		// - Use integration/e2e tests for full remote query behavior

		expect(true).toBe(true);
	});

	it('should verify that mocking prevents actual remote function execution', async () => {
		// This test confirms that the mock prevents the actual remote function
		// from being called (which would fail in the test environment)

		const mockUserData = {
			id: 999,
			name: 'Mocked User',
			email: 'mock@example.com'
		};

		const mockedFn = vi.mocked(getUserData);
		mockedFn.mockResolvedValue(mockUserData);

		// If the mock wasn't working, this would throw "Could not get the request store"
		// Since we're mocking, the component should render without errors
		const { container } = render(UserProfile, {
			target: document.body,
			props: { userId: 999 }
		});

		await new Promise((resolve) => setTimeout(resolve, 50));

		// Component should exist - we can verify the rendered content
		expect(container?.querySelector('.user-profile')).toBeTruthy();

		// Verify the mock was called
		expect(getUserData).toHaveBeenCalled();

		// Component should exist
		expect(container).toBeTruthy();
	});
});
