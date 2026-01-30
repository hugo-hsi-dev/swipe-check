import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-node';
import dotenv from 'dotenv';

// Inject env variables
// Only for db client testing purposes
dotenv.config({ path: '.env' });

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter(), experimental: { remoteFunctions: true } },
	compilerOptions: {
		experimental: {
			async: true
		}
	},
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx']
};

export default config;
