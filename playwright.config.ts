import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.test', '.env'] });

export default defineConfig({
	webServer: {
		command: 'npm run db:push && npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e'
});
