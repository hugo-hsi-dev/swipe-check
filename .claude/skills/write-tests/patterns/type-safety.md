# Type Safety Guidelines

Comprehensive guide for writing type-safe tests in SKit, working with TypeScript, and testing type errors.

## TypeScript Setup for Tests

### Test Configuration

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/lib/test-setup.ts'],
		typecheck: {
			enabled: true,
			tsconfig: './tsconfig.json'
		}
	}
});
```

### Test Type Definitions

```ts
// src/lib/test-types.ts
import type { ComponentProps } from 'svelte';
import type { SvelteComponent } from 'svelte';

// Extend testing library types for Svelte
declare global {
	namespace Vi {
		interface JestAssertion<T = any> {
			toHaveFormError(message: string): T;
			toBeSuccessfulSkitResponse(): T;
		}
	}
}

// Type-safe test utilities
export interface TestRenderResult<T extends SvelteComponent> {
	component: T;
	getByTestId: (testId: string) => HTMLElement;
	queryByTestId: (testId: string) => HTMLElement | null;
	// Add other needed methods
}

export interface MockRemoteResponse<T = any> {
	data: T | null;
	error: { message: string } | null;
}
```

## Type-Safe Component Testing

### Generic Component Test Wrapper

```ts
// src/lib/test-utils.ts
import { render, type RenderResult } from '@testing-library/svelte';
import type { SvelteComponent } from 'svelte';

export function renderTyped<T extends SvelteComponent>(
	component: new (options: any) => T,
	options: {
		props?: ComponentProps<T>;
		slots?: Record<string, string>;
	} = {}
): RenderResult<T> {
	return render(component, options);
}

// Usage with full type inference
function testComponent() {
	const { component, getByText } = renderTyped(MyTypedComponent, {
		props: {
			// Props are fully typed based on MyTypedComponent
			title: 'Hello',
			count: 5
		}
	});

	// component is typed as MyTypedComponent
	expect(component.title).toBe('Hello');
}
```

### Type-Safe Props Testing

```ts
interface TestProps<T> {
	valid: T;
	invalid: Partial<T>;
	edgeCases: Array<Partial<T>>;
}

export function createPropTests<T extends Record<string, any>>(
	Component: new (options: any) => SvelteComponent,
	testProps: TestProps<T>
) {
	describe('props typing', () => {
		it('should accept valid props', () => {
			expect(() => renderTyped(Component, { props: testProps.valid })).not.toThrow();
		});

		it('should handle invalid props gracefully', () => {
			// Test TypeScript compilation at test time
			// This would be caught by tsc --noEmit
			const invalidProps = testProps.invalid;

			// Runtime validation if needed
			expect(() => renderTyped(Component, { props: invalidProps as T })).not.toThrow();
		});

		testProps.edgeCases.forEach((edgeCase, index) => {
			it(`should handle edge case ${index + 1}`, () => {
				expect(() => renderTyped(Component, { props: edgeCase as T })).not.toThrow();
			});
		});
	});
}
```

## Type-Safe Remote Function Testing

### Generic Remote Response Types

```ts
// src/lib/remote-types.ts
export interface SKitResponse<T = any> {
	data: T | null;
	error: { message: string; code?: string } | null;
}

export interface QueryResponse<T = any> extends SKitResponse<T> {}
export interface CommandResponse<T = any> extends SKitResponse<T> {}
export interface FormResponse<T = any> extends SKitResponse<T> {}

// Generic mock factory
export function createMockSkitResponse<T>(
	data?: T,
	error?: { message: string; code?: string }
): SkitResponse<T> {
	return {
		data: data ?? null,
		error: error ?? null
	};
}

// Type-safe mock for remote functions
export function mockRemoteFunction<T extends any[], R>(
	implementation?: (...args: T) => Promise<SkitResponse<R>>
) {
	return vi
		.fn()
		.mockImplementation(implementation ?? (async (...args: T) => createMockSkitResponse<R>()));
}
```

### Typed Command Testing

```ts
import type { CommandResponse } from '$lib/remote-types';

interface CreateUserParams {
	email: string;
	name: string;
	password: string;
}

interface CreateUserResult {
	id: string;
	email: string;
	name: string;
}

describe('createUser command', () => {
	let mockCommand: ReturnType<typeof mockRemoteFunction<CreateUserParams, CreateUserResult>>;

	beforeEach(() => {
		mockCommand = mockRemoteFunction<CreateUserParams, CreateUserResult>();
		vi.mocked(command).mockImplementation(mockCommand);
	});

	it('should type-check parameters correctly', async () => {
		// This would be caught by TypeScript if wrong types are used
		const params: CreateUserParams = {
			email: 'test@example.com',
			name: 'Test User',
			password: 'securepassword123'
		};

		mockCommand.mockResolvedValue(
			createMockSkitResponse<CreateUserResult>({
				id: 'user-123',
				email: params.email,
				name: params.name
			})
		);

		const result: CommandResponse<CreateUserResult> = await createUserCommand(params);

		expect(result.data).toEqual({
			id: 'user-123',
			email: 'test@example.com',
			name: 'Test User'
		});

		// TypeScript ensures we access the right properties
		expect(result.data?.email).toBe('test@example.com');
	});
});
```

### Type-Safe Query Testing

```ts
interface GetUsersParams {
	page?: number;
	limit?: number;
	search?: string;
}

interface User {
	id: string;
	email: string;
	name: string;
}

describe('getUsers query', () => {
	it('should return typed user data', async () => {
		const mockQuery = mockRemoteFunction<GetUsersParams, User[]>();
		vi.mocked(query).mockImplementation(mockQuery);

		const expectedUsers: User[] = [
			{ id: '1', email: 'user1@example.com', name: 'User 1' },
			{ id: '2', email: 'user2@example.com', name: 'User 2' }
		];

		mockQuery.mockResolvedValue(createMockSkitResponse(expectedUsers));

		// TypeScript infers the correct return type
		const result: QueryResponse<User[]> = await getUsersQuery({
			page: 1,
			limit: 10
		});

		// Type-safe array operations
		expect(result.data?.map((u) => u.email)).toEqual(['user1@example.com', 'user2@example.com']);

		// TypeScript prevents accessing non-existent properties
		// @ts-expect-error - Property 'invalidProp' does not exist on type 'User'
		expect(result.data?.[0].invalidProp).toBeUndefined();
	});
});
```

## Form Type Safety

### Type-Safe Form Testing

```ts
interface LoginForm {
	email: string;
	password: string;
	rememberMe?: boolean;
}

interface LoginResponse {
	user: { id: string; email: string };
	token: string;
}

describe('login form type safety', () => {
	it('should validate form fields with correct types', async () => {
		const { getByLabelText, getByRole } = render(LoginFormComponent);

		// TypeScript ensures we're targeting the right fields
		const emailInput = getByLabelText('Email') as HTMLInputElement;
		const passwordInput = getByLabelText('Password') as HTMLInputElement;
		const rememberCheckbox = getByLabelText('Remember me') as HTMLInputElement;

		// Type-safe form filling
		await userEvent.type(emailInput, 'test@example.com');
		await userEvent.type(passwordInput, 'password123');
		await userEvent.click(rememberCheckbox);

		// Assert form values with correct types
		expect(emailInput.value).toBe('test@example.com');
		expect(passwordInput.value).toBe('password123');
		expect(rememberCheckbox.checked).toBe(true);

		// Mock successful login
		vi.mocked(form).mockResolvedValue(
			createMockSkitResponse<LoginResponse>({
				user: { id: '123', email: 'test@example.com' },
				token: 'abc123'
			})
		);

		await userEvent.click(getByRole('button', { name: /login/i }));

		// Type-safe response checking
		const result = await vi.mocked(form).mock.calls[0][1];
		expect(result).toMatchObject<LoginForm>({
			email: 'test@example.com',
			password: 'password123',
			rememberMe: true
		});
	});
});
```

### Zod Schema Testing

```ts
import { z } from 'zod';
import { formAction } from './form-action';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	rememberMe: z.boolean().optional()
});

type LoginData = z.infer<typeof loginSchema>;

describe('form validation type safety', () => {
	it('should validate against Zod schema', async () => {
		const validData: LoginData = {
			email: 'test@example.com',
			password: 'securepassword123',
			rememberMe: true
		};

		// TypeScript ensures validData conforms to the schema
		const parsed = loginSchema.safeParse(validData);
		expect(parsed.success).toBe(true);

		// Test with invalid data
		const invalidData = {
			email: 'invalid-email',
			password: '123' // too short
		};

		const parsedInvalid = loginSchema.safeParse(invalidData);
		expect(parsedInvalid.success).toBe(false);

		if (!parsedInvalid.success) {
			// Type-safe error handling
			const errorMap = parsedInvalid.error.flatten();
			expect(errorMap.fieldErrors.email).toContain('Invalid email');
			expect(errorMap.fieldErrors.password).toContain(
				'String must contain at least 8 character(s)'
			);
		}
	});
});
```

## Testing Type Errors

### Expect-Type-Error Pattern

```ts
// src/lib/type-testing-utils.ts
export function expectTypeError<T>(fn: () => T): never {
	// This function is designed to fail at compile time
	// if the type assertion is incorrect
	throw new Error('Type error should be caught by TypeScript compiler');
}

// Usage in tests (caught by tsc --noEmit)
describe('type error detection', () => {
	it('should catch type mismatches', () => {
		// This would be caught by TypeScript compilation
		// const wrongType: number = 'string'; // TypeScript error

		// For testing runtime behavior with known bad types:
		const castAny = 'string' as any;

		// @ts-expect-error - We expect this to be a type error
		const numberValue: number = castAny;

		expect(typeof numberValue).toBe('string'); // Runtime confirmation
	});
});
```

### Generic Type Testing

```ts
describe('generic type testing', () => {
	interface Repository<T> {
		findById(id: string): Promise<T | null>;
		save(entity: T): Promise<T>;
	}

	class UserRepository implements Repository<User> {
		async findById(id: string): Promise<User | null> {
			// Implementation
			return null;
		}

		async save(entity: User): Promise<User> {
			// Implementation
			return entity;
		}
	}

	it('should maintain type constraints', async () => {
		const repository = new UserRepository();

		// TypeScript ensures correct return type
		const user = await repository.findById('123');

		// user is correctly typed as User | null
		if (user) {
			expect(user.email).toBeDefined(); // Valid property access
			// @ts-expect-error - Property 'invalid' does not exist
			expect(user.invalid).toBeUndefined();
		}

		// Save method maintains type safety
		const newUser: User = {
			id: '123',
			email: 'test@example.com',
			name: 'Test User'
		};

		const savedUser = await repository.save(newUser);
		expect(savedUser.email).toBe('test@example.com');
	});
});
```

## Custom Type Assertions

### Type-Safe Custom Matchers

```ts
// src/lib/test-matchers.ts
import { expect } from 'vitest';

expect.extend({
	toBeValidSkitResponse(received: unknown, expectedType?: string) {
		const isValidResponse =
			typeof received === 'object' &&
			received !== null &&
			'data' in received &&
			'error' in received;

		if (!isValidResponse) {
			return {
				pass: false,
				message: () => `expected ${received} to be a valid SKitResponse`
			};
		}

		const response = received as { data: any; error: any };

		if (expectedType) {
			// Additional type checking if needed
			const hasExpectedData = response.data === null || typeof response.data === expectedType;

			return {
				pass: hasExpectedData,
				message: () =>
					hasExpectedData
						? `expected response data not to be of type ${expectedType}`
						: `expected response data to be of type ${expectedType}`
			};
		}

		return {
			pass: true,
			message: () => `expected ${received} not to be a valid SKitResponse`
		};
	},

	toHaveCorrectType(received: unknown, expectedType: string) {
		const actualType = typeof received;

		return {
			pass: actualType === expectedType,
			message: () =>
				actualType === expectedType
					? `expected value not to be of type ${expectedType}`
					: `expected value to be of type ${expectedType} but got ${actualType}`
		};
	}
});

declare global {
	namespace Vi {
		interface JestAssertion<T = any> {
			toBeValidSkitResponse(expectedType?: string): T;
			toHaveCorrectType(expectedType: string): T;
		}
	}
}
```

## Type Checking in CI/CD

### TypeScript Compilation Tests

```ts
// tests/types/type-check.test.ts
import { describe, it, expect } from 'vitest';

describe('type checking', () => {
	it('should compile without type errors', async () => {
		// This test runs TypeScript compiler on the source code
		// In CI, this would be: tsc --noEmit

		const { exec } = await import('child_process');
		const { promisify } = await import('util');
		const execAsync = promisify(exec);

		try {
			await execAsync('npx tsc --noEmit --skipLibCheck');
			expect(true).toBe(true); // Pass if no compilation errors
		} catch (error) {
			// Fail test on type errors
			expect(error).toBeNull();
		}
	});
});
```

## Best Practices

1. **Strong Typing**: Use TypeScript interfaces and types for all test data
2. **Generic Testing**: Write generic test utilities that maintain type safety
3. **Type Checking**: Run TypeScript compilation in CI to catch type errors
4. **Mock Accuracy**: Ensure mocks match the exact types of real implementations
5. **Schema Validation**: Use Zod or similar for runtime type validation
6. **Documentation**: Document complex types used in tests

← Back to [Reference](../mocks/reference.md)
