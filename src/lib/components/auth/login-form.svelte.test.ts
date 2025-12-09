import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '../../auth/remotes/login';
import LoginForm from './login-form.svelte';
import { render } from 'vitest-browser-svelte';

vi.mock(import('../../auth/remotes/login'), () => {
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
			.mockReturnValue([{ message: 'Invalid email format', path: ['email'] }]);

		const { getByText } = render(LoginForm);

		// Verify email.issues was called
		expect(mockIssues).toHaveBeenCalledTimes(1);

		// Check that email error is displayed
		await expect.element(getByText('Invalid email format')).toBeInTheDocument();
	});
});
