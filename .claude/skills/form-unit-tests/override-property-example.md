# Override Property Examples

## Overriding pending State

```typescript
it('shows loading state when form is submitting', () => {
  // Override pending to simulate submission in progress
  Object.defineProperty(registerUser, 'pending', {
    get: vi.fn(() => 1), // 1 = submitting
    writable: true,
    configurable: true
  });
  
  const { getByText } = render(RegisterForm);
  
  // Button should show loading text and be disabled
  expect(getByText('Creating Account...')).toBeInTheDocument();
  expect(getByText('Creating Account...')).toBeDisabled();
});

it('shows normal state when form is idle', () => {
  // Override pending to simulate idle state
  Object.defineProperty(registerUser, 'pending', {
    get: vi.fn(() => 0), // 0 = idle
    writable: true,
    configurable: true
  });
  
  const { getByText } = render(RegisterForm);
  
  // Button should show normal text and be enabled
  expect(getByText('Create Account')).toBeInTheDocument();
  expect(getByText('Create Account')).not.toBeDisabled();
});
```

## Overriding Action URL

```typescript
it('uses correct form action', () => {
  // Override action property
  Object.defineProperty(registerUser, 'action', {
    get: vi.fn(() => '/api/auth/register'),
    writable: true,
    configurable: true
  });
  
  const { container } = render(RegisterForm);
  const form = container.querySelector('form');
  
  expect(form?.getAttribute('action')).toBe('/api/auth/register');
});
```

## Overriding Result

```typescript
it('handles successful submission', () => {
  // Override result to simulate successful response
  Object.defineProperty(registerUser, 'result', {
    get: vi.fn(() => ({
      success: true,
      data: { userId: '123', email: 'user@example.com' }
    })),
    writable: true,
    configurable: true
  });
  
  const { getByText } = render(RegisterForm);
  
  // Test success state (redirect, success message, etc.)
});
```

## Best Practices

```typescript
describe('Form State Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('disables button during submission', () => {
    // Set pending for this test only
    Object.defineProperty(registerUser, 'pending', {
      get: vi.fn(() => 1),
      writable: true,
      configurable: true
    });
    
    render(RegisterForm);
    // ... assertions
  });
  
  it('enables button when not submitting', () => {
    // Different pending value for this test
    Object.defineProperty(registerUser, 'pending', {
      get: vi.fn(() => 0),
      writable: true,
      configurable: true
    });
    
    render(RegisterForm);
    // ... assertions
  });
});
```