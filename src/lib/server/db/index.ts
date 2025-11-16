import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import * as authSchema from './auth-schema';

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(DATABASE_URL);

// Create drizzle instance with both app and auth schemas
export const db = drizzle(client, {
	schema: { ...schema, ...authSchema }
});

// Export schemas for convenience
export { schema, authSchema };
