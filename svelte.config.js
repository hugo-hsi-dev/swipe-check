import adapter from '@sveltejs/adapter-node';
import { mdsvex } from 'mdsvex';
import dotenv from 'dotenv';

// Inject env variables
// Only for db client testing purposes
dotenv.config({ path: '.env' });

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { experimental: { remoteFunctions: true }, adapter: adapter() },
	compilerOptions: {
		experimental: {
			async: true
		}
	},
	extensions: ['.svelte', '.svx'],
	preprocess: [mdsvex()]
};

export default config;
