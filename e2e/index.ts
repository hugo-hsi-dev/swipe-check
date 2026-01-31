/* eslint-disable no-empty-pattern */

import { test as base } from '@playwright/test';
import { reset, seed } from 'drizzle-seed';

import * as schema from '../src/lib/server/db/schema';
import { db } from '../src/lib/server/db';

export const test = base.extend<{ schema: typeof schema; db: typeof db }>({
	db: [
		async ({}, use) => {
			await seed(db as never, schema);
			await use(db);
			await reset(db as never, schema);
		},
		{ auto: true }
	],
	schema: async ({}, use) => {
		await use(schema);
	}
});
