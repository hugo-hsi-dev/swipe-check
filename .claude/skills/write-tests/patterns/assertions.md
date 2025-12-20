# Assertion Patterns

Common assertion patterns and best practices for SKit testing, covering forms, commands, queries, auth, and more.

## Core Assertion Patterns

### Basic Assertions

```ts
import { expect, vi } from 'vitest';

// Truthiness
expect(value).toBe(true);
expect(value).toBe(false);
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Equality
expect(actual).toBe(expected); // Strict equality (===)
expect(actual).toEqual(expected); // Deep equality
expect(actual).toStrictEqual(expected); // Deep equality with strict type checking

// Numbers
expect(count).toBeGreaterThan(0);
expect(count).toBeGreaterThanOrEqual(1);
expect(count).toBeLessThan(100);
expect(count).toBeLessThanOrEqual(99);
expect(count).toBeCloseTo(3.14, 2);

// Strings
expect(text).toContain('substring');
expect(text).toMatch(/regex/);
expect(text).toHaveLength(10);
expect(text).startsWith('prefix');
expect(text).endsWith('suffix');
```

### Array and Object Assertions

```ts
// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toEqual(expect.arrayContaining([item1, item2]));
expect(array).toEqual(expect.any(Array));
expect(array[0]).toEqual(expect.objectContaining({ id: '123' }));

// Objects
expect(obj).toEqual(expectedObj);
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key', 'value');
expect(obj).toEqual(expect.objectContaining({ key: 'value' }));
expect(obj).toEqual(expect.any(Object));

// Mixed
expect(users).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'John' })]));
```

## Form Testing Assertions

### Form Validation

```ts
describe('form validation', () => {
	it('should validate required fields', async () => {
		const { getByLabelText, getByRole } = render(MyForm);

		const submitButton = getByRole('button', { name: /submit/i });

		// Test empty required field
		await submitButton.click();

		expect(getByLabelText('Email')).toBeInvalid();
		expect(getByLabelText('Email')).toHaveErrorMessage('Email is required');
		expect(getByLabelText('Name')).toHaveErrorMessage('Name is required');
	});

	it('should validate email format', async () => {
		const { getByLabelText } = render(MyForm);

		const emailInput = getByLabelText('Email');
		await emailInput.type('invalid-email');
		// Tab or blur to trigger validation
		await emailInput.blur();

		expect(emailInput).toBeInvalid();
		expect(emailInput).toHaveErrorMessage(/invalid email/i);
	});

	it('should accept valid form data', async () => {
		const { getByLabelText, getByRole } = render(MyForm);
		const mockSubmit = vi.fn();

		// Fill valid form
		const nameInput = getByLabelText('Name');
		const emailInput = getByLabelText('Email');
		await nameInput.type('John Doe');
		await emailInput.type('john@example.com');

		await getByRole('button', { name: /submit/i }).click();

		expect(mockSubmit).toHaveBeenCalledWith({
			name: 'John Doe',
			email: 'john@example.com'
		});
	});
});
```

### Form State Assertions

```ts
it('should handle form loading state', async () => {
	const { getByRole, queryByRole } = render(MyForm);
	const submitButton = getByRole('button', { name: /submit/i });

	// Initially not loading
	expect(submitButton).not.toBeDisabled();
	expect(queryByRole('progressbar')).not.toBeInTheDocument();

	// Simulate loading
	await submitButton.click();

	// Loading state
	expect(submitButton).toBeDisabled();
	expect(getByRole('progressbar')).toBeInTheDocument();
	expect(getByRole('button', { name: /submit/i })).toHaveTextContent(/loading/i);
});
```

## Command Testing Assertions

### Command Success Assertions

```ts
describe('command execution', () => {
	beforeEach(() => {
		vi.mocked(command).mockResolvedValue({
			data: { success: true, id: '123' },
			error: null
		});
	});

	it('should execute command successfully', async () => {
		const result = await executeSomeCommand({ param: 'value' });

		expect(result.data).toEqual({ success: true, id: '123' });
		expect(result.error).toBeNull();
		expect(command).toHaveBeenCalledWith({
			param: 'value',
			type: 'some-command'
		});
	});

	it('should update UI after successful command', async () => {
		const { getByRole, getByText } = render(CommandComponent);

		await getByRole('button', { name: /execute/i }).click();

		await waitFor(() => {
			expect(getByText(/success/i)).toBeInTheDocument();
		});
	});
});
```

### Command Error Assertions

```ts
it('should handle command errors gracefully', async () => {
	vi.mocked(command).mockResolvedValue({
		data: null,
		error: { message: 'Command failed', code: 'COMMAND_ERROR' }
	});

	const { getByRole, getByText } = render(CommandComponent);

	await userEvent.click(getByRole('button', { name: /execute/i }));

	await waitFor(() => {
		expect(getByText(/command failed/i)).toBeInTheDocument();
	});

	// Component should remain functional
	expect(getByRole('button', { name: /execute/i })).not.toBeDisabled();
});
```

## Query Testing Assertions

### Query Data Assertions

```ts
describe('query data handling', () => {
	it('should display query results', async () => {
		vi.mocked(query).mockResolvedValue({
			data: [
				{ id: '1', name: 'Item 1' },
				{ id: '2', name: 'Item 2' }
			],
			error: null
		});

		const { getByText, findAllByRole } = render(QueryComponent);

		await waitFor(() => {
			expect(getByText(/item 1/i)).toBeInTheDocument();
			expect(getByText(/item 2/i)).toBeInTheDocument();
		});

		const items = await findAllByRole('listitem');
		expect(items).toHaveLength(2);
	});

	it('should handle empty query results', async () => {
		vi.mocked(query).mockResolvedValue({
			data: [],
			error: null
		});

		const { getByText, queryByRole } = render(QueryComponent);

		await waitFor(() => {
			expect(getByText(/no items found/i)).toBeInTheDocument();
		});

		expect(queryByRole('listitem')).not.toBeInTheDocument();
	});
});
```

### Query Loading and Error Assertions

```ts
it('should show loading state during query', async () => {
	// Create a promise that we control
	let resolveQuery: (value: any) => void;
	const queryPromise = new Promise((resolve) => {
		resolveQuery = resolve;
	});

	vi.mocked(query).mockReturnValue(queryPromise);

	const { getByRole, queryByText } = render(QueryComponent);

	// Should show loading immediately
	expect(getByRole('progressbar')).toBeInTheDocument();
	expect(queryByText(/item 1/i)).not.toBeInTheDocument();

	// Resolve the query
	resolveQuery({ data: [{ id: '1', name: 'Item 1' }], error: null });

	await waitFor(() => {
		expect(getByRole('progressbar')).not.toBeInTheDocument();
		expect(getByText(/item 1/i)).toBeInTheDocument();
	});
});

it('should handle query errors', async () => {
	vi.mocked(query).mockResolvedValue({
		data: null,
		error: { message: 'Network error' }
	});

	const { getByText } = render(QueryComponent);

	await waitFor(() => {
		expect(getByText(/network error/i)).toBeInTheDocument();
	});
});
```

## Authentication Testing Assertions

### Login Form Assertions

```ts
describe('authentication', () => {
	it('should validate login credentials', async () => {
		vi.mocked(command).mockResolvedValue({
			data: { user: { id: '123', email: 'test@example.com' }, token: 'abc123' },
			error: null
		});

		const { getByLabelText, getByRole } = render(LoginForm);

		const emailInput = getByLabelText('Email');
		const passwordInput = getByLabelText('Password');
		await emailInput.type('test@example.com');
		await passwordInput.type('password123');
		await getByRole('button', { name: /login/i }).click();

		await waitFor(() => {
			expect(command).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123'
			});
		});
	});

	it('should show error for invalid credentials', async () => {
		vi.mocked(command).mockResolvedValue({
			data: null,
			error: { message: 'Invalid credentials' }
		});

		const { getByLabelText, getByRole, getByText } = render(LoginForm);

		const emailInput = getByLabelText('Email');
		const passwordInput = getByLabelText('Password');
		await emailInput.type('test@example.com');
		await passwordInput.type('wrongpassword');
		await getByRole('button', { name: /login/i }).click();

		await waitFor(() => {
			expect(getByText(/invalid credentials/i)).toBeInTheDocument();
		});
	});
});
```

### Protected Route Assertions

```ts
it('should redirect unauthenticated users', async () => {
	vi.mocked(query).mockResolvedValue({
		data: null,
		error: { message: 'Not authenticated' }
	});

	const { mockNavigate } = render(ProtectedRoute);

	await waitFor(() => {
		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});
});

it('should allow access to authenticated users', async () => {
	vi.mocked(query).mockResolvedValue({
		data: { user: { id: '123', email: 'test@example.com' } },
		error: null
	});

	const { getByText } = render(ProtectedRoute);

	await waitFor(() => {
		expect(getByText(/welcome/i)).toBeInTheDocument();
	});
});
```

## Component State Assertions

### Reactive State Testing

```ts
it('should update reactive state correctly', async () => {
	const { getByRole, getByText } = render(CounterComponent);

	expect(getByText(/count: 0/i)).toBeInTheDocument();

	await getByRole('button', { name: /increment/i }).click();

	expect(getByText(/count: 1/i)).toBeInTheDocument();

	await getByRole('button', { name: /decrement/i }).click();

	expect(getByText(/count: 0/i)).toBeInTheDocument();
});
```

### Props and Slots Assertions

```ts
it('should render with custom props', () => {
	const { getByText } = render(CustomComponent, {
		props: {
			title: 'Custom Title',
			variant: 'primary'
		}
	});

	expect(getByText('Custom Title')).toBeInTheDocument();
	expect(getByRole('heading')).toHaveClass('primary');
});

it('should render slot content', () => {
	const { getByText } = render(CustomComponent, {
		props: {},
		slots: {
			default: 'Custom slot content'
		}
	});

	expect(getByText('Custom slot content')).toBeInTheDocument();
});
```

## Error Handling Assertions

### Error Boundary Testing

```ts
it('should catch and display errors', async () => {
	const { getByText } = render(ErrorBoundaryComponent, {
		props: {
			// Trigger error
			shouldError: true
		}
	});

	await waitFor(() => {
		expect(getByText(/something went wrong/i)).toBeInTheDocument();
	});
});
```

### Network Error Assertions

```ts
it('should handle network timeouts', async () => {
	vi.mocked(command).mockRejectedValue(new Error('Network timeout'));

	const { getByRole, getByText } = render(NetworkComponent);

	await getByRole('button', { name: /submit/i }).click();

	await waitFor(() => {
		expect(getByText(/network error/i)).toBeInTheDocument();
	});
});
```

## Custom Assertions

### Custom Matcher Functions

```ts
// Custom assertion for SKit responses
expect.extend({
	toBeSuccessfulSkitResponse(received: any) {
		const pass = received.data !== null && received.error === null;

		return {
			pass,
			message: () =>
				pass
					? `expected response not to be successful`
					: `expected response to be successful but got ${JSON.stringify(received)}`
		};
	},

	toHaveFormError(received: any, expectedMessage: string) {
		const pass = received.error?.message === expectedMessage;

		return {
			pass,
			message: () =>
				pass
					? `expected response not to have error "${expectedMessage}"`
					: `expected response to have error "${expectedMessage}" but got "${received.error?.message}"`
		};
	}
});

// Usage
expect(response).toBeSuccessfulSkitResponse();
expect(response).toHaveFormError('Email is required');
```

## Best Practices

1. **Specific Assertions**: Test specific behavior, not implementation details
2. **User-Centric Tests**: Assert what users see and can do
3. **Error Cases**: Always test error scenarios alongside success cases
4. **Accessibility**: Include a11y assertions for UI components
5. **Performance**: Avoid unnecessary DOM queries in assertions
6. **Timeouts**: Use appropriate timeout values for async operations

← Back to [Reference](../mocks/reference.md)
