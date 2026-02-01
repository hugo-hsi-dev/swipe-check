import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import GetStartedPage from './+page.svelte';

describe('/get-started/+page.svelte', () => {
	it('should render welcome card title', async () => {
		render(GetStartedPage);
		const title = page.getByText(/welcome/i);
		await expect.element(title).toBeInTheDocument();
	});
});
