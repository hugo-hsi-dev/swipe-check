import { expect, test } from '@playwright/test';

const generateUniqueUser = () => {
	const id = Math.random().toString(36).substring(2, 7);
	return {
		email: `test-${id}@example.com`,
		username: `user_${id}`,
		password: 'SecurePassword123!'
	};
};

test.describe('Auth Guards', () => {
	test('Unauthenticated user is blocked from /app with 401', async ({ page }) => {
		const response = await page.goto('/app');
		expect(response?.status()).toBe(401);
		await expect(page.locator('text=/signed in/i')).toBeVisible();
	});

	test('Authenticated user is redirected from /login to /app', async ({ page }) => {
		const user = generateUniqueUser();

		await page.goto('/register');
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/login');
		await expect(page).toHaveURL('/app');
	});

	test('Authenticated user is redirected from /register to /app', async ({ page }) => {
		const user = generateUniqueUser();

		await page.goto('/register');
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/register');
		await expect(page).toHaveURL('/app');
	});

	test('Authenticated user can access /app', async ({ page }) => {
		const user = generateUniqueUser();

		await page.goto('/register');
		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/app');
		await expect(page).toHaveURL('/app');
		await expect(page.locator('h1')).toHaveText('App Dashboard');
	});
});
