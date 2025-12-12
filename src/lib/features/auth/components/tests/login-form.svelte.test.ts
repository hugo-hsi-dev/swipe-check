import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '../../remotes/login.remote';
import LoginForm from '../login-form.svelte';
import { render } from 'vitest-browser-svelte';

vi.mock(import('../../remotes/login.remote'), () => {
	return {
		login: {
			action: '',
			buttonProps: {
				enhance: vi.fn(),
				formaction: '',
				formmethod: 'POST' as const,
				onclick: vi.fn(),
				pending: 0,
				type: 'submit' as const
			},
			enhance: vi.fn(),
			for: vi.fn(),
			method: 'POST' as const,
			pending: 0,
			preflight: vi.fn(),
			result: undefined,
			validate: vi.fn(),
			fields: {
				allIssues: vi.fn(),
				issues: vi.fn(),
				set: vi.fn(),
				value: vi.fn(),
				email: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				},
				password: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				}
			}
		}
	};
});

// Email validation tests for mock implementation
describe('LoginForm Email Mock Tests', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no email validation errors when email.issues returns empty array', async () => {
		// Mock email with no validation issues
		const mockIssues = vi.mocked(login.fields.email.issues).mockReturnValue([]);

		render(LoginForm);

		// Verify email.issues was called
		expect(mockIssues).toHaveBeenCalledTimes(1);

		// Should not show any email error messages
		const { container } = render(LoginForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Invalid email');
	});

	it('displays email validation error when email.issues returns error', async () => {
		// Mock email with validation error
		const mockIssues = vi
			.mocked(login.fields.email.issues)
			.mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);

		const { getByText } = render(LoginForm);

		// Verify email.issues was called
		expect(mockIssues).toHaveBeenCalledTimes(1);

		// Check that email error is displayed
		await expect.element(getByText('Invalid email address')).toBeInTheDocument();
	});
});

// Password validation tests
describe('LoginForm Password Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no password validation errors when password.issues returns empty array', async () => {
		const mockIssues = vi.mocked(login.fields.password.issues).mockReturnValue([]);

		render(LoginForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		const { container } = render(LoginForm);
		const errorText = container.textContent || '';
		// Check for actual password error messages, not the label
		expect(errorText).not.toContain('Password is required');
		expect(errorText).not.toContain('Invalid email or password');
		expect(errorText).not.toContain('Email not verified');
	});

	it('displays password validation error when password.issues returns error', async () => {
		const mockIssues = vi
			.mocked(login.fields.password.issues)
			.mockReturnValue([{ message: 'Password is required', path: ['password'] }]);

		const { getByText } = render(LoginForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('Password is required')).toBeInTheDocument();
	});

	it('displays invalid email or password error', async () => {
		vi.mocked(login.fields.password.issues).mockReturnValue([
			{ message: 'Invalid email or password', path: ['password'] }
		]);

		const { getByText } = render(LoginForm);

		await expect.element(getByText('Invalid email or password')).toBeInTheDocument();
	});

	it('displays email not verified error', async () => {
		vi.mocked(login.fields.password.issues).mockReturnValue([
			{ message: 'Email not verified', path: ['password'] }
		]);

		const { getByText } = render(LoginForm);

		await expect.element(getByText('Email not verified')).toBeInTheDocument();
	});
});

// Form interaction tests
describe('LoginForm Form Interaction', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('renders form with correct action', () => {
		const { container } = render(LoginForm);
		const form = container.querySelector('form');

		expect(form).toBeTruthy();
		expect(form?.getAttribute('action')).toBe('');
	});

	it('renders email input with correct attributes', () => {
		const emailAsMock = vi.mocked(login.fields.email.as);
		emailAsMock.mockReturnValue({
			type: 'email',
			name: 'email',
			id: 'email',
			placeholder: '',
			value: '',
			required: true
		});

		render(LoginForm);

		expect(emailAsMock).toHaveBeenCalledWith('email');
	});

	it('renders password input with correct attributes', () => {
		const passwordAsMock = vi.mocked(login.fields.password.as);
		passwordAsMock.mockReturnValue({
			type: 'password',
			name: 'password',
			id: 'password',
			placeholder: '',
			value: '',
			required: true
		});

		render(LoginForm);

		expect(passwordAsMock).toHaveBeenCalledWith('password');
	});

	it('displays submit button with correct text when not pending', () => {
		Object.defineProperty(login, 'pending', {
			get: vi.fn(() => 0)
		});

		const { getByText } = render(LoginForm);

		expect(getByText('Sign In')).toBeTruthy();
		const button = getByText('Sign In');
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).not.toBeDisabled();
	});

	it('displays submit button with loading text when pending', () => {
		Object.defineProperty(login, 'pending', {
			get: vi.fn(() => 1)
		});
		const { getByText } = render(LoginForm);

		expect(getByText('Signing In...')).toBeTruthy();
		const button = getByText('Signing In...');
		expect(button).toBeDisabled();
	});
});

// Multiple field validation tests
describe('LoginForm Multiple Field Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('displays both email and password errors when both have issues', async () => {
		const emailIssues = vi
			.mocked(login.fields.email.issues)
			.mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);
		const passwordIssues = vi
			.mocked(login.fields.password.issues)
			.mockReturnValue([{ message: 'Password is required', path: ['password'] }]);

		const { getByText } = render(LoginForm);

		await expect.element(getByText('Invalid email address')).toBeInTheDocument();
		await expect.element(getByText('Password is required')).toBeInTheDocument();
		expect(emailIssues).toHaveBeenCalledTimes(1);
		expect(passwordIssues).toHaveBeenCalledTimes(1);
	});

	it('displays no errors when both fields are valid', async () => {
		const emailIssues = vi.mocked(login.fields.email.issues).mockReturnValue([]);
		const passwordIssues = vi.mocked(login.fields.password.issues).mockReturnValue([]);

		const { container } = render(LoginForm);
		const errorText = container.textContent || '';

		expect(errorText).not.toContain('Invalid email address');
		expect(errorText).not.toContain('Password is required');
		expect(errorText).not.toContain('Invalid email or password');
		expect(errorText).not.toContain('Email not verified');
		expect(emailIssues).toHaveBeenCalledTimes(1);
		expect(passwordIssues).toHaveBeenCalledTimes(1);
	});
});
