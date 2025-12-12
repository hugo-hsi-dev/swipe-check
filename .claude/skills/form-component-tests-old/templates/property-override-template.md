# Overriding Form Properties

Use `Object.defineProperty` to override properties that can't be mocked with `mockReturnValue()`.

## Override Pattern

```typescript
Object.defineProperty(formRemote, 'propertyName', {
	get: vi.fn(() => value),
	writable: true,
	configurable: true
});
```

## Common Overrides

### Pending State (Form Submission)

Controls submit button state and loading indicators:

```typescript
// Form is idle (not submitting)
Object.defineProperty(registerUser, 'pending', {
	get: vi.fn(() => 0),
	writable: true,
	configurable: true
});

// Form is submitting
Object.defineProperty(registerUser, 'pending', {
	get: vi.fn(() => 1), // Can be >1 for multiple submissions
	writable: true,
	configurable: true
});
```

### Action URL

Form submission endpoint:

```typescript
Object.defineProperty(registerUser, 'action', {
	get: vi.fn(() => '/api/auth/register'),
	writable: true,
	configurable: true
});
```

### Form Result

Submission response data:

```typescript
// Successful submission
Object.defineProperty(registerUser, 'result', {
	get: vi.fn(() => ({
		success: true,
		data: { userId: '123', email: 'user@example.com' }
	})),
	writable: true,
	configurable: true
});

// Failed submission
Object.defineProperty(registerUser, 'result', {
	get: vi.fn(() => ({
		success: false,
		error: 'Registration failed'
	})),
	writable: true,
	configurable: true
});
```

## Test Examples

### Testing Loading State

```typescript
it('shows loading state when form is submitting', () => {
  // Override pending to simulate submission
  Object.defineProperty(registerUser, 'pending', {
    get: vi.fn(() => 1),
    writable: true,
    configurable: true
  });
  
  const { getByText } = render(RegisterForm);
  
  // Assert button shows loading state
  expect(getByText('Creating Account...')).toBeInTheDocument();
  expect(getByText('Creating Account...')).toBeDisabled();
});

it('shows normal state when form is idle', () => {
  // Override pending to simulate idle state
  Object.defineProperty(registerUser, 'pending', {
    get: vi.fn(() => 0),
    writable: true,
    configurable: true
  });
  
  const { getByText } = render(RegisterForm);
  
  // Assert button shows normal state
  expect(getByText('Create Account')).toBeInTheDocument();
  expect(getByText('Create Account')).not.toBeDisabled();
});
```

### Testing Form Attributes

```typescript
it('uses correct form action and method', () => {
  // Override action and method
  Object.defineProperty(registerUser, 'action', {
    get: vi.fn(() => '/api/auth/register'),
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(registerUser, 'method', {
    get: vi.fn(() => 'POST'),
    writable: true,
    configurable: true
  });
  
  const { container } = render(RegisterForm);
  const form = container.querySelector('form');
  
  expect(form?.getAttribute('action')).toBe('/api/auth/register');
  expect(form?.getAttribute('method')).toBe('POST');
});
```

## Best Practices

1. **Always include** `writable: true` and `configurable: true`
2. **Override inside individual tests**, not globally
3. **Use `beforeEach`** to clean up between tests
4. **Test different values** in different tests

```typescript
describe('Form State Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('disables button during submission', () => {
    Object.defineProperty(registerUser, 'pending', {
      get: vi.fn(() => 1),
      writable: true,
      configurable: true
    });
    
    render(RegisterForm);
    // ... assertions
  });
});
```

## When to Use Property Overrides

- Property is a primitive value (not a function)
- Property has getters/setters
- `mockReturnValue()` doesn't work
- You need to override read-only properties
- Testing form state changes (pending, result, action)