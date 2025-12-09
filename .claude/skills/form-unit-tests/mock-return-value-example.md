# Mock Return Value Examples

## Mocking Validation Errors

```typescript
// Mock email field with invalid email error
const mockEmailIssues = vi.mocked(registerUser.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);

// Mock password field with required error
const mockPasswordIssues = vi.mocked(registerUser.fields.password.issues)
  .mockReturnValue([{ message: 'Password is required', path: ['password'] }]);

// Mock name field with minimum length error
const mockNameIssues = vi.mocked(registerUser.fields.name.issues)
  .mockReturnValue([{ message: 'Name must be at least 2 characters', path: ['name'] }]);

// Mock with no errors (valid field)
const mockValidIssues = vi.mocked(registerUser.fields.confirmPassword.issues)
  .mockReturnValue([]);
```

## Mocking Input Attributes

```typescript
// Mock email input attributes
const mockEmailAs = vi.mocked(registerUser.fields.email.as)
  .mockReturnValue({
    type: 'email',
    name: 'email',
    id: 'email',
    placeholder: 'Enter your email',
    required: true,
    autocomplete: 'email'
  });

// Mock password input attributes
const mockPasswordAs = vi.mocked(registerUser.fields.password.as)
  .mockReturnValue({
    type: 'password',
    name: 'password',
    id: 'password',
    placeholder: 'Enter your password',
    required: true,
    autocomplete: 'new-password'
  });
```

## Mocking Field Values

```typescript
// Mock current field values
const mockEmailValue = vi.mocked(registerUser.fields.email.value)
  .mockReturnValue('user@example.com');

const mockPasswordValue = vi.mocked(registerUser.fields.password.value)
  .mockReturnValue('');
```

## Usage in Tests

```typescript
it('displays validation errors', async () => {
  // Set up the mock
  const mockIssues = vi.mocked(registerUser.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  // Render component
  render(RegisterForm);
  
  // Assert error is displayed
  expect(mockIssues).toHaveBeenCalledTimes(1);
  await expect.element(getByText('Invalid email')).toBeInTheDocument();
});
```