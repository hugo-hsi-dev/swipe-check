import { expect } from '@playwright/test';

import { test } from '.';

test('anonymous authentication flow', async ({ page }) => {
	await page.goto('/login');
	const signInBtn = page.getByRole('button', { name: /sign in anonymously/i });
	await expect(signInBtn).toBeVisible();
	await signInBtn.click();
	await expect(page).toHaveURL(/\/get-started$/);
	await expect(page.getByText('User ID')).toBeVisible();
	await expect(page.getByText('Anonymous')).toBeVisible();
	const signOutBtn = page.getByRole('button', { name: /sign out/i });
	await expect(signOutBtn).toBeVisible();
	await signOutBtn.click();
	await expect(page).toHaveURL(/\/login$/);
});
