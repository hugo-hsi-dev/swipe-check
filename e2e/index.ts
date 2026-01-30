import { test as base } from '@playwright/test';
import { db } from '../src/lib/server/db';
import { reset, seed } from 'drizzle-seed';
import * as schema from '../src/lib/server/db/schema';

export const test = base.extend<{ db: typeof db; schema: typeof schema }>({
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
