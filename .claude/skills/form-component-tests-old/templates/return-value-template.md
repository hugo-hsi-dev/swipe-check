# Mocking Field Return Values

Use these patterns to mock return values for field methods in your tests.

## Mock Validation Errors

```typescript
// Single error
const mockEmailIssues = vi.mocked(formRemote.fields.email.issues)
  .mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);

// Multiple errors for same field
const mockPasswordIssues = vi.mocked(formRemote.fields.password.issues)
  .mockReturnValue([
    { message: 'Password is required', path: ['password'] },
    { message: 'Password must be at least 8 characters', path: ['password'] }
  ]);

// No errors (valid field)
const mockValidIssues = vi.mocked(formRemote.fields.confirmPassword.issues)
  .mockReturnValue([]);
```

## Mock Input Attributes

```typescript
// Email field attributes
const mockEmailAs = vi.mocked(formRemote.fields.email.as)
  .mockReturnValue({
    type: 'email',
    name: 'email',
    id: 'email',
    placeholder: 'Enter your email',
    required: true,
    autocomplete: 'email'
  });

// Password field attributes
const mockPasswordAs = vi.mocked(formRemote.fields.password.as)
  .mockReturnValue({
    type: 'password',
    name: 'password',
    id: 'password',
    placeholder: 'Enter your password',
    required: true,
    autocomplete: 'new-password'
  });

// Text field attributes
const mockNameAs = vi.mocked(formRemote.fields.name.as)
  .mockReturnValue({
    type: 'text',
    name: 'name',
    id: 'name',
    placeholder: 'Your full name',
    required: true,
    autocomplete: 'name'
  });
```

## Mock Field Values

```typescript
// Mock current field values
const mockEmailValue = vi.mocked(formRemote.fields.email.value)
  .mockReturnValue('user@example.com');

const mockPasswordValue = vi.mocked(formRemote.fields.password.value)
  .mockReturnValue('securepassword');

const mockNameValue = vi.mocked(formRemote.fields.name.value)
  .mockReturnValue('');
```

## Complete Test Example

```typescript
it('displays validation errors', async () => {
  // Set up validation error mocks
  const mockEmailIssues = vi.mocked(registerUser.fields.email.issues)
    .mockReturnValue([{ message: 'Invalid email', path: ['email'] }]);
  
  const mockPasswordIssues = vi.mocked(registerUser.fields.password.issues)
    .mockReturnValue([{ message: 'Password required', path: ['password'] }]);
  
  // Mock input attributes
  const mockEmailAs = vi.mocked(registerUser.fields.email.as)
    .mockReturnValue({
      type: 'email',
      name: 'email',
      id: 'email',
      required: true
    });
  
  // Render component
  const { getByText, container } = render(RegisterForm);
  
  // Assert mocks were called
  expect(mockEmailIssues).toHaveBeenCalledTimes(1);
  expect(mockPasswordIssues).toHaveBeenCalledTimes(1);
  expect(mockEmailAs).toHaveBeenCalledTimes(1);
  
  // Assert errors are displayed
  await expect.element(getByText('Invalid email')).toBeInTheDocument();
  await expect.element(getByText('Password required')).toBeInTheDocument();
  
  // Assert input has correct attributes
  const emailInput = container.querySelector('#email');
  expect(emailInput).toHaveAttribute('type', 'email');
  expect(emailInput).toHaveAttribute('required');
});
```

## Pattern Summary

- **formRemote** - Your mocked form remote (e.g., `loginUser`, `registerUser`)
- **fieldName** - The field you're mocking (e.g., `email`, `password`)
- **mockReturnValue()** - Sets what the method returns when called
- Store mock references for assertions in your tests
- Each test can set different values as needed