import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RegisterForm from './RegisterForm.svelte';

// Mock the registerUser function
vi.mock('$lib/auth/remotes/registerUser', () => ({
	registerUser: {
		fields: {
			name: {
				as: vi.fn(() => ({ id: 'name', name: 'name', type: 'text' })),
				issues: vi.fn(() => [])
			},
			email: {
				as: vi.fn(() => ({ id: 'email', name: 'email', type: 'email' })),
				issues: vi.fn(() => [])
			},
			password: {
				as: vi.fn(() => ({ id: 'password', name: 'password', type: 'password' })),
				issues: vi.fn(() => [])
			},
			confirmPassword: {
				as: vi.fn(() => ({ id: 'confirmPassword', name: 'confirmPassword', type: 'password' })),
				issues: vi.fn(() => [])
			}
		},
		pending: false
	}
}));

describe('RegisterForm.svelte', () => {
	let mockRegisterUser: any;

	beforeEach(async () => {
		vi.clearAllMocks();

		// Get the mocked module
		const { registerUser } = await import('$lib/auth/remotes/registerUser');
		mockRegisterUser = registerUser;

		// Reset all mock functions to default values
		mockRegisterUser.fields.name.as.mockReturnValue({ id: 'name', name: 'name', type: 'text' });
		mockRegisterUser.fields.email.as.mockReturnValue({ id: 'email', name: 'email', type: 'email' });
		mockRegisterUser.fields.password.as.mockReturnValue({
			id: 'password',
			name: 'password',
			type: 'password'
		});
		mockRegisterUser.fields.confirmPassword.as.mockReturnValue({
			id: 'confirmPassword',
			name: 'confirmPassword',
			type: 'password'
		});

		mockRegisterUser.fields.name.issues.mockReturnValue([]);
		mockRegisterUser.fields.email.issues.mockReturnValue([]);
		mockRegisterUser.fields.password.issues.mockReturnValue([]);
		mockRegisterUser.fields.confirmPassword.issues.mockReturnValue([]);

		mockRegisterUser.pending = false;
	});

	it('renders all form fields', async () => {
		render(RegisterForm);

		// Check that all field labels are rendered (use exact: true to avoid ambiguity)
		await expect.element(page.getByText('Name', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Email', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Password', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Confirm Password', { exact: true })).toBeInTheDocument();
	});

	it('renders submit button with correct text', async () => {
		render(RegisterForm);

		const submitButton = page.getByRole('button', { name: 'Create Account' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});

	it('uses correct input types for each field', async () => {
		render(RegisterForm);

		// Check that field.as() is called with correct types
		expect(mockRegisterUser.fields.name.as).toHaveBeenCalledWith('text');
		expect(mockRegisterUser.fields.email.as).toHaveBeenCalledWith('email');
		expect(mockRegisterUser.fields.password.as).toHaveBeenCalledWith('password');
		expect(mockRegisterUser.fields.confirmPassword.as).toHaveBeenCalledWith('password');
	});

	it('shows loading state when form is pending', async () => {
		mockRegisterUser.pending = true;

		render(RegisterForm);

		const submitButton = page.getByRole('button', { name: 'Creating Account...' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).toBeDisabled();
	});

	it('shows normal state when form is not pending', async () => {
		mockRegisterUser.pending = false;

		render(RegisterForm);

		const submitButton = page.getByRole('button', { name: 'Create Account' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});

	it('has form element', async () => {
		const { container } = render(RegisterForm);
		const form = container.querySelector('form');

		expect(form).toBeInTheDocument();
	});

	it('calls field.as() method with correct parameters', async () => {
		render(RegisterForm);

		// Verify that each field's as method was called with the correct type
		expect(mockRegisterUser.fields.name.as).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.name.as).toHaveBeenCalledWith('text');

		expect(mockRegisterUser.fields.email.as).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.email.as).toHaveBeenCalledWith('email');

		expect(mockRegisterUser.fields.password.as).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.password.as).toHaveBeenCalledWith('password');

		expect(mockRegisterUser.fields.confirmPassword.as).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.confirmPassword.as).toHaveBeenCalledWith('password');
	});

	it('calls field.issues() method for each field', async () => {
		render(RegisterForm);

		// Verify that each field's issues method was called
		expect(mockRegisterUser.fields.name.issues).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.email.issues).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.password.issues).toHaveBeenCalledTimes(1);
		expect(mockRegisterUser.fields.confirmPassword.issues).toHaveBeenCalledTimes(1);
	});

	it('displays validation errors when present', async () => {
		// Mock validation errors
		mockRegisterUser.fields.name.issues.mockReturnValue([{ message: 'Name is required' }]);
		mockRegisterUser.fields.email.issues.mockReturnValue([{ message: 'Invalid email' }]);

		render(RegisterForm);

		// Check that errors are displayed
		await expect.element(page.getByText('Name is required')).toBeInTheDocument();
		await expect.element(page.getByText('Invalid email')).toBeInTheDocument();
	});

	it('has accessible form structure', async () => {
		render(RegisterForm);

		// Check that the form has proper structure with labels and inputs
		const nameInput = page.getByRole('textbox', { name: /name/i });
		const emailInput = page.getByRole('textbox', { name: /email/i });

		await expect.element(nameInput).toBeInTheDocument();
		await expect.element(emailInput).toBeInTheDocument();
	});

	it('renders password inputs correctly', async () => {
		render(RegisterForm);

		// Check for password inputs by finding input elements with type="password"
		const { container } = render(RegisterForm);
		const passwordInputs = container.querySelectorAll('input[type="password"]');

		expect(passwordInputs).toHaveLength(2);
	});

	it('spreads field attributes correctly', async () => {
		render(RegisterForm);

		// Verify that the as method returns are being used (spread onto inputs)
		expect(mockRegisterUser.fields.name.as).toHaveBeenCalled();
		expect(mockRegisterUser.fields.email.as).toHaveBeenCalled();
		expect(mockRegisterUser.fields.password.as).toHaveBeenCalled();
		expect(mockRegisterUser.fields.confirmPassword.as).toHaveBeenCalled();
	});

	it('has correct number of input fields', async () => {
		const { container } = render(RegisterForm);

		// Check for all expected input types
		const textInputs = container.querySelectorAll('input[type="text"], input[type="email"]');
		const passwordInputs = container.querySelectorAll('input[type="password"]');

		expect(textInputs).toHaveLength(2); // name and email
		expect(passwordInputs).toHaveLength(2); // password and confirm password
	});

	it('button state changes with pending prop', async () => {
		// Test loading state
		mockRegisterUser.pending = true;
		const { unmount } = render(RegisterForm);

		let submitButton = page.getByRole('button', { name: 'Creating Account...' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).toBeDisabled();

		// Clean up and test normal state
		unmount();
		mockRegisterUser.pending = false;
		render(RegisterForm);

		submitButton = page.getByRole('button', { name: 'Create Account' });
		await expect.element(submitButton).toBeInTheDocument();
		await expect.element(submitButton).not.toBeDisabled();
	});
});
