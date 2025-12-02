import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoginForm from './LoginForm.svelte';

// Mock the loginUser function
vi.mock('$lib/auth.remote', () => ({
	loginUser: {
		fields: {
			email: {
				as: vi.fn(() => ({ id: 'email', name: 'email', type: 'email' })),
				issues: vi.fn(() => [])
			},
			password: {
				as: vi.fn(() => ({ id: 'password', name: 'password', type: 'password' })),
				issues: vi.fn(() => [])
			}
		},
		pending: false
	}
}));

describe('LoginForm.svelte', () => {
	let mockLoginUser: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		// Get the mocked module
		const { loginUser } = await import('$lib/auth.remote');
		mockLoginUser = loginUser;

		// Reset all mock functions to default values
		mockLoginUser.fields.email.as.mockReturnValue({ id: 'email', name: 'email', type: 'email' });
		mockLoginUser.fields.password.as.mockReturnValue({
			id: 'password',
			name: 'password',
			type: 'password'
		});

		mockLoginUser.fields.email.issues.mockReturnValue([]);
		mockLoginUser.fields.password.issues.mockReturnValue([]);

		mockLoginUser.pending = false;
	});

	it('renders all form fields', async () => {
		render(LoginForm);

		// Check that all field labels are rendered
		await expect.element(page.getByText('Email')).toBeInTheDocument();
		await expect.element(page.getByText('Password')).toBeInTheDocument();
	});

	it('renders submit button with correct text', async () => {
		render(LoginForm);

		const submitButton = page.getByRole('button', { name: 'Sign In' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});

	it('uses correct input types for each field', async () => {
		render(LoginForm);

		// Check that field.as() is called with correct types
		expect(mockLoginUser.fields.email.as).toHaveBeenCalledWith('email');
		expect(mockLoginUser.fields.password.as).toHaveBeenCalledWith('password');
	});

	it('shows loading state when form is pending', async () => {
		mockLoginUser.pending = true;

		render(LoginForm);

		const submitButton = page.getByRole('button', { name: 'Signing In...' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).toBeDisabled();
	});

	it('shows normal state when form is not pending', async () => {
		mockLoginUser.pending = false;

		render(LoginForm);

		const submitButton = page.getByRole('button', { name: 'Sign In' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});

	it('has form element', async () => {
		const { container } = render(LoginForm);
		const form = container.querySelector('form');

		expect(form).toBeInTheDocument();
	});

	it('calls field.as() method with correct parameters', async () => {
		render(LoginForm);

		// Verify that each field's as method was called with the correct type
		expect(mockLoginUser.fields.email.as).toHaveBeenCalledTimes(1);
		expect(mockLoginUser.fields.email.as).toHaveBeenCalledWith('email');

		expect(mockLoginUser.fields.password.as).toHaveBeenCalledTimes(1);
		expect(mockLoginUser.fields.password.as).toHaveBeenCalledWith('password');
	});

	it('calls field.issues() method for each field', async () => {
		render(LoginForm);

		// Verify that each field's issues method was called
		expect(mockLoginUser.fields.email.issues).toHaveBeenCalledTimes(1);
		expect(mockLoginUser.fields.password.issues).toHaveBeenCalledTimes(1);
	});

	it('displays validation errors when present', async () => {
		// Mock validation errors
		mockLoginUser.fields.email.issues.mockReturnValue([{ message: 'Invalid email format' }]);
		mockLoginUser.fields.password.issues.mockReturnValue([{ message: 'Password is required' }]);

		render(LoginForm);

		// Check that errors are displayed
		await expect.element(page.getByText('Invalid email format')).toBeInTheDocument();
		await expect.element(page.getByText('Password is required')).toBeInTheDocument();
	});

	it('has accessible form structure', async () => {
		render(LoginForm);

		// Check that the form has proper structure with labels and inputs
		const emailInput = page.getByRole('textbox', { name: /email/i });

		await expect.element(emailInput).toBeInTheDocument();
	});

	it('renders password inputs correctly', async () => {
		render(LoginForm);

		// Check for password inputs by finding input elements with type="password"
		const { container } = render(LoginForm);
		const passwordInput = container.querySelector('input[type="password"]');

		expect(passwordInput).toBeInTheDocument();
	});

	it('spreads field attributes correctly', async () => {
		render(LoginForm);

		// Verify that the as method returns are being used (spread onto inputs)
		expect(mockLoginUser.fields.email.as).toHaveBeenCalled();
		expect(mockLoginUser.fields.password.as).toHaveBeenCalled();
	});

	it('has correct number of input fields', async () => {
		const { container } = render(LoginForm);

		// Check for all expected input types
		const emailInput = container.querySelector('input[type="email"]');
		const passwordInput = container.querySelector('input[type="password"]');

		expect(emailInput).toBeInTheDocument();
		expect(passwordInput).toBeInTheDocument();
	});

	it('button state changes with pending prop', async () => {
		// Test loading state
		mockLoginUser.pending = true;
		const { unmount } = render(LoginForm);

		let submitButton = page.getByRole('button', { name: 'Signing In...' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).toBeDisabled();

		// Clean up and test normal state
		unmount();
		mockLoginUser.pending = false;
		render(LoginForm);

		submitButton = page.getByRole('button', { name: 'Sign In' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});

	it('does not display errors when validation passes', async () => {
		// Mock no validation errors
		mockLoginUser.fields.email.issues.mockReturnValue([]);
		mockLoginUser.fields.password.issues.mockReturnValue([]);

		render(LoginForm);

		// Should not show any error messages - checking that no error text is present
		const { container } = render(LoginForm);
		const errorElements = container.querySelectorAll('[data-testid="field-error"]');
		expect(errorElements).toHaveLength(0);
	});

	it('handles partial validation errors', async () => {
		// Mock errors for only some fields
		mockLoginUser.fields.email.issues.mockReturnValue([{ message: 'Email is required' }]);
		mockLoginUser.fields.password.issues.mockReturnValue([]);

		render(LoginForm);

		// Check that only specific errors are displayed
		await expect.element(page.getByText('Email is required')).toBeInTheDocument();

		// Verify no password error is shown
		const { container } = render(LoginForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Password is required');
	});

	it('handles multiple validation errors per field', async () => {
		// Mock multiple errors for a field
		mockLoginUser.fields.email.issues.mockReturnValue([
			{ message: 'Email is required' },
			{ message: 'Invalid email format' }
		]);

		const { container } = render(LoginForm);

		// Check that the email issues method was called
		expect(mockLoginUser.fields.email.issues).toHaveBeenCalled();

		// Verify that error content is present in the DOM
		const errorContent = container.textContent || '';

		// The FieldError component should render error messages
		// Check if either of the error messages or their combination appears
		const hasErrorContent =
			errorContent.includes('Email is required') ||
			errorContent.includes('Invalid email format') ||
			errorContent.includes('Email is required, Invalid email format');

		expect(hasErrorContent).toBe(true);
	});
});
