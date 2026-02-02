import { drizzle } from 'drizzle-orm/postgres-js';
import { defineRelations } from 'drizzle-orm';
import postgres from 'postgres';

import * as authSchema from './auth.schema';
import * as appSchema from './app.schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL);
const schema = { ...authSchema, ...appSchema };
const relations = defineRelations(schema, () => ({}));

export const db = drizzle({ casing: 'snake_case', relations, client });
export { schema };
