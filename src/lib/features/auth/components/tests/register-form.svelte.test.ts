import { beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from '../../remotes/register.remote';
import RegisterForm from '../register-form.svelte';
import { render } from 'vitest-browser-svelte';

vi.mock(import('../../remotes/register.remote'), () => {
	return {
		register: {
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
				name: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				},
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
				},
				confirmPassword: {
					as: vi.fn(),
					issues: vi.fn(() => []),
					set: vi.fn(),
					value: vi.fn()
				}
			}
		}
	};
});

// Name validation tests
describe('RegisterForm Name Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no name validation errors when name.issues returns empty array', async () => {
		const mockIssues = vi.mocked(register.fields.name.issues).mockReturnValue([]);

		render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		const { container } = render(RegisterForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Name is required');
	});

	it('displays name validation error when name.issues returns error', async () => {
		const mockIssues = vi
			.mocked(register.fields.name.issues)
			.mockReturnValue([{ message: 'Name is required', path: ['name'] }]);

		const { getByText } = render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('Name is required')).toBeInTheDocument();
	});
});

// Email validation tests
describe('RegisterForm Email Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no email validation errors when email.issues returns empty array', async () => {
		const mockIssues = vi.mocked(register.fields.email.issues).mockReturnValue([]);

		render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		const { container } = render(RegisterForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Invalid email address');
	});

	it('displays email validation error when email.issues returns error', async () => {
		const mockIssues = vi
			.mocked(register.fields.email.issues)
			.mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);

		const { getByText } = render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('Invalid email address')).toBeInTheDocument();
	});

	it('displays user already exists error', async () => {
		vi.mocked(register.fields.email.issues).mockReturnValue([
			{ message: 'User already exists', path: ['email'] }
		]);

		const { getByText } = render(RegisterForm);

		await expect.element(getByText('User already exists')).toBeInTheDocument();
	});
});

// Password validation tests
describe('RegisterForm Password Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no password validation errors when password.issues returns empty array', async () => {
		const mockIssues = vi.mocked(register.fields.password.issues).mockReturnValue([]);

		render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		const { container } = render(RegisterForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Password must be at least 8 characters');
		expect(errorText).not.toContain('Password must be less than 128 characters');
	});

	it('displays password too short error', async () => {
		vi.mocked(register.fields.password.issues).mockReturnValue([
			{ message: 'Password must be at least 8 characters', path: ['password'] }
		]);

		const { getByText } = render(RegisterForm);

		await expect.element(getByText('Password must be at least 8 characters')).toBeInTheDocument();
	});

	it('displays password too long error', async () => {
		vi.mocked(register.fields.password.issues).mockReturnValue([
			{ message: 'Password must be less than 128 characters', path: ['password'] }
		]);

		const { getByText } = render(RegisterForm);

		await expect
			.element(getByText('Password must be less than 128 characters'))
			.toBeInTheDocument();
	});
});

// Confirm password validation tests
describe('RegisterForm Confirm Password Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no confirm password validation errors when confirmPassword.issues returns empty array', async () => {
		const mockIssues = vi.mocked(register.fields.confirmPassword.issues).mockReturnValue([]);

		render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		const { container } = render(RegisterForm);
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Passwords must match');
	});

	it('displays passwords must match error when confirmPassword.issues returns error', async () => {
		const mockIssues = vi
			.mocked(register.fields.confirmPassword.issues)
			.mockReturnValue([{ message: 'Passwords must match', path: ['confirmPassword'] }]);

		const { getByText } = render(RegisterForm);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('Passwords must match')).toBeInTheDocument();
	});
});

// Form interaction tests
describe('RegisterForm Form Interaction', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('renders form with correct action', () => {
		const { container } = render(RegisterForm);
		const form = container.querySelector('form');

		expect(form).toBeTruthy();
		expect(form?.getAttribute('action')).toBe('');
	});

	it('renders name input with correct attributes', () => {
		const nameAsMock = vi.mocked(register.fields.name.as);
		nameAsMock.mockReturnValue({
			type: 'text',
			name: 'name',
			id: 'name',
			placeholder: '',
			value: '',
			required: true
		});

		render(RegisterForm);

		expect(nameAsMock).toHaveBeenCalledWith('text');
	});

	it('renders email input with correct attributes', () => {
		const emailAsMock = vi.mocked(register.fields.email.as);
		emailAsMock.mockReturnValue({
			type: 'email',
			name: 'email',
			id: 'email',
			placeholder: '',
			value: '',
			required: true
		});

		render(RegisterForm);

		expect(emailAsMock).toHaveBeenCalledWith('email');
	});

	it('renders password input with correct attributes', () => {
		const passwordAsMock = vi.mocked(register.fields.password.as);
		passwordAsMock.mockReturnValue({
			type: 'password',
			name: 'password',
			id: 'password',
			placeholder: '',
			value: '',
			required: true
		});

		render(RegisterForm);

		expect(passwordAsMock).toHaveBeenCalledWith('password');
	});

	it('renders confirm password input with correct attributes', () => {
		const confirmPasswordAsMock = vi.mocked(register.fields.confirmPassword.as);
		confirmPasswordAsMock.mockReturnValue({
			type: 'password',
			name: 'confirmPassword',
			id: 'confirmPassword',
			placeholder: '',
			value: '',
			required: true
		});

		render(RegisterForm);

		expect(confirmPasswordAsMock).toHaveBeenCalledWith('password');
	});

	it('displays submit button with correct text when not pending', () => {
		Object.defineProperty(register, 'pending', {
			get: vi.fn(() => 0)
		});

		const { getByText } = render(RegisterForm);

		expect(getByText('Create Account')).toBeTruthy();
		const button = getByText('Create Account');
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).not.toBeDisabled();
	});

	it('displays submit button with loading text when pending', () => {
		Object.defineProperty(register, 'pending', {
			get: vi.fn(() => 1)
		});

		const { getByText } = render(RegisterForm);

		expect(getByText('Creating Account...')).toBeTruthy();
		const button = getByText('Creating Account...');
		expect(button).toBeDisabled();
	});
});

// Multiple field validation tests
describe('RegisterForm Multiple Field Validation', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('displays all field errors when all have issues', async () => {
		const nameIssues = vi
			.mocked(register.fields.name.issues)
			.mockReturnValue([{ message: 'Name is required', path: ['name'] }]);
		const emailIssues = vi
			.mocked(register.fields.email.issues)
			.mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);
		const passwordIssues = vi
			.mocked(register.fields.password.issues)
			.mockReturnValue([{ message: 'Password must be at least 8 characters', path: ['password'] }]);
		const confirmPasswordIssues = vi
			.mocked(register.fields.confirmPassword.issues)
			.mockReturnValue([{ message: 'Passwords must match', path: ['confirmPassword'] }]);

		const { getByText } = render(RegisterForm);

		await expect.element(getByText('Name is required')).toBeInTheDocument();
		await expect.element(getByText('Invalid email address')).toBeInTheDocument();
		await expect.element(getByText('Password must be at least 8 characters')).toBeInTheDocument();
		await expect.element(getByText('Passwords must match')).toBeInTheDocument();

		expect(nameIssues).toHaveBeenCalledTimes(1);
		expect(emailIssues).toHaveBeenCalledTimes(1);
		expect(passwordIssues).toHaveBeenCalledTimes(1);
		expect(confirmPasswordIssues).toHaveBeenCalledTimes(1);
	});

	it('displays no errors when all fields are valid', async () => {
		const nameIssues = vi.mocked(register.fields.name.issues).mockReturnValue([]);
		const emailIssues = vi.mocked(register.fields.email.issues).mockReturnValue([]);
		const passwordIssues = vi.mocked(register.fields.password.issues).mockReturnValue([]);
		const confirmPasswordIssues = vi
			.mocked(register.fields.confirmPassword.issues)
			.mockReturnValue([]);

		const { container } = render(RegisterForm);
		const errorText = container.textContent || '';

		expect(errorText).not.toContain('Name is required');
		expect(errorText).not.toContain('Invalid email address');
		expect(errorText).not.toContain('Password must be at least 8 characters');
		expect(errorText).not.toContain('Passwords must match');

		expect(nameIssues).toHaveBeenCalledTimes(1);
		expect(emailIssues).toHaveBeenCalledTimes(1);
		expect(passwordIssues).toHaveBeenCalledTimes(1);
		expect(confirmPasswordIssues).toHaveBeenCalledTimes(1);
	});

	it('displays partial errors when only some fields have issues', async () => {
		const nameIssues = vi.mocked(register.fields.name.issues).mockReturnValue([]);
		const emailIssues = vi
			.mocked(register.fields.email.issues)
			.mockReturnValue([{ message: 'Invalid email address', path: ['email'] }]);
		const passwordIssues = vi.mocked(register.fields.password.issues).mockReturnValue([]);
		const confirmPasswordIssues = vi
			.mocked(register.fields.confirmPassword.issues)
			.mockReturnValue([{ message: 'Passwords must match', path: ['confirmPassword'] }]);

		const { getByText, container } = render(RegisterForm);

		// Check that errors are displayed for invalid fields
		await expect.element(getByText('Invalid email address')).toBeInTheDocument();
		await expect.element(getByText('Passwords must match')).toBeInTheDocument();

		// Check that valid fields have no errors
		const errorText = container.textContent || '';
		expect(errorText).not.toContain('Name is required');
		expect(errorText).not.toContain('Password must be at least 8 characters');

		expect(nameIssues).toHaveBeenCalledTimes(1);
		expect(emailIssues).toHaveBeenCalledTimes(1);
		expect(passwordIssues).toHaveBeenCalledTimes(1);
		expect(confirmPasswordIssues).toHaveBeenCalledTimes(1);
	});
});
