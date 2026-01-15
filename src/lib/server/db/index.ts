export * from './schema';

import type { db as pgDb } from './postgres';

type Database = typeof pgDb;

let db: Database;

// Use PGLite (embedded) for development and e2e testing
// Only use postgres in production when DATABASE_URL is explicitly set
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
	const { db: pgDb } = await import('./postgres');
	db = pgDb;
} else {
	const { db: pgliteDb } = await import('./pglite');
	db = pgliteDb as unknown as Database;
}

export { db };
