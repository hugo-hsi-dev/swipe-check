import { expect, test } from '@playwright/test';

const generateUniqueUser = () => {
	const id = Math.random().toString(36).substring(2, 7);
	return {
		email: `test-${id}@example.com`,
		username: `user_${id}`,
		password: 'SecurePassword123!'
	};
};

test.describe('Login Flow', () => {
	let user: ReturnType<typeof generateUniqueUser>;

	test.beforeAll(async ({ browser }) => {
		user = generateUniqueUser();
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto('/register');
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page.getByRole('button', { name: /register|submit/i }).click();
		await page.waitForURL('/');
		await context.close();
	});

	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('Successful Login', async ({ page }) => {
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="password"]').fill(user.password);
		await page.getByRole('button', { name: /log in|sign in/i }).click();

		await expect(page).toHaveURL('/');
	});

	test('Invalid Credentials', async ({ page }) => {
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="password"]').fill('WrongPassword123!');
		await page.getByRole('button', { name: /log in|sign in/i }).click();

		await expect(page.locator('text=/invalid|failed|incorrect/i').first()).toBeVisible();
		expect(page.url()).toContain('/login');
	});

	test('Form Validation', async ({ page }) => {
		await page.getByRole('button', { name: /log in|sign in/i }).click();

		await expect(page.locator('text=/required/i').first()).toBeVisible();
	});

	test('Logout', async ({ page }) => {
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="password"]').fill(user.password);
		await page.getByRole('button', { name: /log in|sign in/i }).click();
		await expect(page).toHaveURL('/');

		await page.evaluate(() => {
			const form = document.createElement('form');
			form.method = 'POST';
			form.action = '/logout';
			document.body.appendChild(form);
			form.submit();
		});

		await expect(page).toHaveURL('/login');
	});
});
