import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import LoginPage from './+page.svelte';

describe('/login/+page.svelte', () => {
	it('should render sign in card title', async () => {
		render(LoginPage);
		const title = page.getByText(/^Sign In$/);
		await expect.element(title).toBeInTheDocument();
	});

	it('should render sign in button', async () => {
		render(LoginPage);
		const button = page.getByRole('button', { name: /sign in anonymously/i });
		await expect.element(button).toBeInTheDocument();
	});
});
