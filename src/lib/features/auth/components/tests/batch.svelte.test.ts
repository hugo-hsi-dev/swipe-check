import { beforeEach, describe, expect, it, vi } from 'vitest';
import CurrentUser from '../current-user.svelte';
import type { User } from '../../types';
import { render } from 'vitest-browser-svelte';
import { batchTestRemote } from '../../remotes/batch-test.remote';
import Batch from '../batch.svelte';

vi.mock(import('../../remotes/batch-test.remote'), () => {
	return {
		batchTestRemote: vi.fn()
	};
});

describe('LoginForm Email Mock Tests', async () => {
	beforeEach(async () => {
		vi.clearAllMocks();
	});

	it('shows no email validation errors when email.issues returns empty array', async () => {
		// Mock email with no validation issues

		const mockIssues = vi
			.mocked(batchTestRemote)
			.mockRejectedValue({ status: 500, message: 'hello LOL' });

		const { getByText } = render(Batch);

		expect(mockIssues).toHaveBeenCalledTimes(1);

		await expect.element(getByText('hello LOL')).toBeInTheDocument();
	});
});
