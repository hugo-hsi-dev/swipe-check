import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { db } from './db/index.js';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: [anonymous() as any]
});
