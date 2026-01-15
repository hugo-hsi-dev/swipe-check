import { drizzle } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

const pgliteInstance = new PGlite();
export const db = drizzle(pgliteInstance, { schema });

// Apply schema to database on startup
const { pushSchema } = await import('drizzle-kit/api');
const { apply } = await pushSchema(schema, db as any);
await apply();
