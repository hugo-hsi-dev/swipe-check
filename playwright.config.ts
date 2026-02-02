import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.test', '.env'], quiet: true });

export default defineConfig({
	webServer: {
		command: 'pnpm db:push && pnpm build && pnpm preview',
		timeout: 300000,
		port: 4173,
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe'
	},
	testDir: 'e2e',
	workers: 1
});
