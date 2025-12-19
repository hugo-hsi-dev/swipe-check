# Test Structure Patterns

Basic templates and patterns for organizing SKit tests in both client and server environments.

## Client Test Structure

### Component Test Template

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import type { ComponentProps } from 'svelte';

// Import the component being tested
import YourComponent from './YourComponent.svelte';

// Mock any remote functions used by the component
vi.mock('../../remotes/*.remote', () => ({
	'*': vi.fn()
}));

describe('YourComponent', () => {
	let mockProps: ComponentProps<YourComponent>;

	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();

		// Setup default props
		mockProps = {
			// Define default props here
		};
	});

	afterEach(() => {
		// Cleanup after each test if needed
		vi.restoreAllMocks();
	});

	describe('when rendered with default props', () => {
		it('should display correctly', () => {
			render(YourComponent, { props: mockProps });

			// Add your assertions here
			expect(screen.getByRole('button')).toBeInTheDocument();
		});
	});

	describe('when user interacts with the component', () => {
		it('should handle click events', async () => {
			const { component } = render(YourComponent, { props: mockProps });

			// Test user interactions
			await userEvent.click(screen.getByRole('button'));

			// Assert expected behavior
			expect(/* expected outcome */).toBe(true);
		});
	});
});
```

### Test Organization Pattern

```ts
describe('ComponentName', () => {
	// 1. Setup and Teardown
	beforeEach(() => {
		// Common setup for all tests
	});

	afterEach(() => {
		// Common cleanup
	});

	// 2. Render Tests
	describe('rendering', () => {
		it('should render without errors', () => {
			// Basic render test
		});

		it('should display all required elements', () => {
			// Element existence tests
		});

		it('should apply correct classes/styles', () => {
			// Visual testing
		});
	});

	// 3. Interaction Tests
	describe('user interactions', () => {
		it('should handle clicks', () => {
			// Click behavior
		});

		it('should handle form inputs', () => {
			// Form interaction
		});

		it('should handle keyboard navigation', () => {
			// Accessibility testing
		});
	});

	// 4. Edge Cases
	describe('edge cases', () => {
		it('should handle empty data', () => {
			// Empty state testing
		});

		it('should handle error states', () => {
			// Error handling
		});
	});

	// 5. Integration Tests
	describe('integration', () => {
		it('should work with mocked remotes', () => {
			// Test with mocked remote functions
		});

		it('should handle loading states', () => {
			// Loading state testing
		});
	});
});
```

## Server Test Structure

### Remote Function Test Template

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

// Mock $app/server
vi.mock('$app/server', () => ({
	query: vi.fn(),
	command: vi.fn(),
	form: vi.fn(),
	prerender: vi.fn()
}));

import { query, command, form, prerender } from '$app/server';

// Import the function being tested
import { yourRemoteFunction } from './your-remote-file';

describe('yourRemoteFunction', () => {
	let mockQuery: Mock;
	let mockCommand: Mock;
	let mockForm: Mock;
	let mockPrerender: Mock;

	beforeEach(() => {
		mockQuery = vi.mocked(query);
		mockCommand = vi.mocked(command);
		mockForm = vi.mocked(form);
		mockPrerender = vi.mocked(prerender);

		// Setup default mock implementations
		mockQuery.mockResolvedValue({ data: null, error: null });
		mockCommand.mockResolvedValue({ data: null, error: null });
		mockForm.mockResolvedValue({ data: null, error: null });
		mockPrerender.mockResolvedValue({ data: null, error: null });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('when called with valid parameters', () => {
		it('should return expected result', async () => {
			// Setup mock response
			mockQuery.mockResolvedValue({
				data: {
					/* expected data */
				},
				error: null
			});

			// Call the function
			const result = await yourRemoteFunction({
				/* params */
			});

			// Assertions
			expect(result.data).toEqual({
				/* expected data */
			});
			expect(result.error).toBeNull();
			expect(mockQuery).toHaveBeenCalledWith({
				/* expected args */
			});
		});
	});

	describe('when called with invalid parameters', () => {
		it('should return appropriate error', async () => {
			// Setup mock error response
			mockQuery.mockResolvedValue({
				data: null,
				error: { message: 'Invalid input' }
			});

			const result = await yourRemoteFunction({ invalid: 'param' });

			expect(result.data).toBeNull();
			expect(result.error).toEqual({ message: 'Invalid input' });
		});
	});
});
```

### Database Integration Test Pattern

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../server/db';
import { yourDbFunction } from './your-db-function';

describe('yourDbFunction', () => {
	beforeEach(async () => {
		// Setup test data
		await db.insert(testTable).values({
			id: 'test-id'
			// ...test data
		});
	});

	afterEach(async () => {
		// Cleanup test data
		await db.delete(testTable).where(eq(testTable.id, 'test-id'));
	});

	it('should interact with database correctly', async () => {
		const result = await yourDbFunction('test-id');

		expect(result).toBeDefined();
		expect(result.id).toBe('test-id');
	});
});
```

## Setup and Teardown Patterns

### Reusable Test Utilities

```ts
// test-utils.ts
import { render, type RenderOptions } from '@testing-library/svelte';
import { vi } from 'vitest';
import type { ComponentProps } from 'svelte';

export function createMockProps<T extends Record<string, any>>(defaults: Partial<T> = {}): T {
	return {
		// Default mock values
		...defaults
	} as T;
}

export function renderWithMocks<T extends Record<string, any>>(
	component: any,
	props: T = {} as T,
	options: RenderOptions = {}
) {
	// Setup any global mocks
	vi.clearAllMocks();

	return render(component, {
		props,
		...options
	});
}

export function createMockRemoteFunction(implementation?: Function) {
	return vi.fn().mockImplementation(implementation || (() => ({ data: null, error: null })));
}
```

### Async Test Patterns

```ts
describe('async operations', () => {
	it('should handle promises correctly', async () => {
		// Using async/await
		const result = await someAsyncFunction();
		expect(result).toBeDefined();
	});

	it('should handle multiple async operations', async () => {
		// Promise.all pattern
		const [result1, result2] = await Promise.all([asyncFunction1(), asyncFunction2()]);

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	it('should handle timeouts', async () => {
		// Timeout testing
		const result = await Promise.race([
			slowAsyncFunction(),
			new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
		]);

		expect(result).toBeDefined();
	});
});
```

## Best Practices

1. **Consistent Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
3. **Test Isolation**: Ensure tests don't depend on each other
4. **Mock Management**: Clear and restore mocks properly
5. **Error Coverage**: Test both success and failure scenarios
6. **Accessibility**: Include a11y testing for UI components

← Back to [Reference](../mocks/reference.md)
