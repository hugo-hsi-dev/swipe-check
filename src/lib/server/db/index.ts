import { NODE_ENV } from '$env/static/private';

export * from './schema';

let db;

if (NODE_ENV === 'production') {
	const { db: pgDb } = await import('./postgres');
	db = pgDb;
} else {
	const { db: pgliteDb } = await import('./pglite');
	db = pgliteDb;
}

export { db };
