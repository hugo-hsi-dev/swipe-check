import { expect, test } from '@playwright/test';

/**
 * Sign-up Flow E2E Tests
 *
 * These tests focus on the critical paths of the registration process.
 * They are designed to be resilient to minor UI changes by using:
 * 1. Role-based and name-based selectors
 * 2. Regex-based text matching for error messages
 * 3. Relative URLs (assuming baseURL is configured or handled by the runner)
 */

const generateUniqueUser = () => {
	const id = Math.random().toString(36).substring(2, 7);
	return {
		email: `test-${id}@example.com`,
		username: `user_${id}`,
		password: 'SecurePassword123!'
	};
};

test.describe('Registration Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register');
	});

	test('Successful Registration (Happy Path)', async ({ page }) => {
		const user = generateUniqueUser();

		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);

		await page.getByRole('button', { name: /register|submit/i }).click();

		await expect(page).toHaveURL('/');
	});

	test('Form Validation - Required Fields', async ({ page }) => {
		await page.getByRole('button', { name: /register|submit/i }).click();

		const errorPattern = /required|empty|missing|blank/i;

		await expect(
			page.locator('[data-slot="field-error"]').filter({ hasText: errorPattern }).first()
		).toBeVisible();

		expect(page.url()).toContain('/register');
	});

	test('Form Validation - Invalid Email Format', async ({ page }) => {
		await page.locator('input[name="email"]').fill('not-an-email');
		await page.getByRole('button', { name: /register|submit/i }).click();

		await expect(page.locator('text=/invalid|format|email/i').first()).toBeVisible();
	});

	test('Form Validation - Password Requirements', async ({ page }) => {
		const user = generateUniqueUser();

		await page.locator('input[name="password"]').fill('123');
		await page.locator('input[name="passwordConfirmation"]').fill('123');
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page.locator('text=/short|length|at least/i').first()).toBeVisible();

		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill('MismatchedPass123!');
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page.locator('text=/match|confirm/i').first()).toBeVisible();
	});

	test('Data Normalization - Case Insensitivity', async ({ page }) => {
		const id = Math.random().toString(36).substring(2, 7);
		const mixedCaseEmail = `TEST-${id}@EXAMPLE.COM`;
		const mixedCaseUsername = `User_${id}`;
		const password = 'SecurePassword123!';

		await page.locator('input[name="email"]').fill(mixedCaseEmail);
		await page.locator('input[name="username"]').fill(mixedCaseUsername);
		await page.locator('input[name="password"]').fill(password);
		await page.locator('input[name="passwordConfirmation"]').fill(password);

		await page.getByRole('button', { name: /register|submit/i }).click();

		await expect(page).toHaveURL('/');
	});

	test('Handling Duplicates', async ({ page, context }) => {
		const user = generateUniqueUser();

		await page.locator('input[name="email"]').fill(user.email);
		await page.locator('input[name="username"]').fill(user.username);
		await page.locator('input[name="password"]').fill(user.password);
		await page.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page.getByRole('button', { name: /register|submit/i }).click();
		await expect(page).toHaveURL('/');

		const page2 = await context.newPage();
		await page2.goto('/register');

		if (page2.url().endsWith('/app')) {
			await page2.evaluate(() => {
				const form = document.createElement('form');
				form.method = 'POST';
				form.action = '/logout';
				document.body.appendChild(form);
				form.submit();
			});
			await page2.waitForURL('/login');
			await page2.goto('/register');
		}

		await page2.locator('input[name="email"]').fill(user.email);
		await page2.locator('input[name="username"]').fill(user.username + '_new');
		await page2.locator('input[name="password"]').fill(user.password);
		await page2.locator('input[name="passwordConfirmation"]').fill(user.password);
		await page2.getByRole('button', { name: /register|submit/i }).click();

		await expect(page2.locator('text=/already|exists|taken/i').first()).toBeVisible();
		expect(page2.url()).toContain('/register');
	});
});
