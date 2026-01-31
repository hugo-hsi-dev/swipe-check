import { integer, pgTable, serial } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
	id: serial()
});

export const user = pgTable('user', { id: serial().primaryKey(), age: integer() });
