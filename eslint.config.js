import perfectionist from 'eslint-plugin-perfectionist';
import { includeIgnoreFile } from '@eslint/compat';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import globals from 'globals';
import path from 'node:path';
import js from '@eslint/js';

import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	{
		ignores: ['src/lib/components/ui/**', 'src/lib/hooks/**']
	},
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	perfectionist.configs['recommended-line-length'],
	{
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		},
		languageOptions: { globals: { ...globals.browser, ...globals.node } }
	},
	{
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				projectService: true,
				parser: ts.parser,
				svelteConfig
			}
		},
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js']
	}
);
