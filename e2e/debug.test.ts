import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test('debug: check form submission', async ({ page }) => {
	await page.goto(`${BASE_URL}/signup`);

	// Fill form with invalid password
	await page.fill('input[name="email"]', 'test@example.com');
	await page.fill('input[name="username"]', 'testuser');
	await page.fill('input[name="password"]', 'lowercase123'); // No uppercase

	// Take screenshot before submit
	await page.screenshot({ path: 'before-submit.png' });

	// Submit form
	await page.click('button[type="submit"]');

	// Wait a bit for response
	await page.waitForTimeout(2000);

	// Take screenshot after submit
	await page.screenshot({ path: 'after-submit.png' });

	// Get page content
	const content = await page.content();
	console.log('Page HTML:', content);

	// Check if error message exists anywhere
	const allText = await page.textContent('body');
	console.log('Body text:', allText);
});
