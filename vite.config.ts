import { playwright } from '@vitest/browser-playwright';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					browser: {
						instances: [{ browser: 'chromium', headless: true }],
						provider: playwright(),
						enabled: true
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					name: 'client'
				},
				extends: './vite.config.ts'
			},

			{
				test: {
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					include: ['src/**/*.{test,spec}.{js,ts}'],
					environment: 'node',
					name: 'server'
				},
				extends: './vite.config.ts'
			}
		],
		expect: { requireAssertions: true }
	},
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()]
});
