import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getValidatedUser } from '../../remotes/getValidatedUser.remote';
import CurrentUser from '../current-user.svelte';
import type { User } from '../../types';
import { render } from 'vitest-browser-svelte';

vi.mock(import('../../remotes/getValidatedUser.remote'), () => {
	return {
		getValidatedUser: vi.fn()
	};
});

describe('LoginForm Email Mock Tests', async () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no email validation errors when email.issues returns empty array', async () => {
		// Mock email with no validation issues

		const mockUser = { name: 'Hugo Hsi' } as User;

		const mockIssues = vi.mocked(getValidatedUser).mockResolvedValue(mockUser);

		const { getByText } = render(CurrentUser);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('Hugo Hsi')).toBeInTheDocument();
	});
});
