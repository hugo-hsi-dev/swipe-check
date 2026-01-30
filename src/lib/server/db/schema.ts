import { pgTable, serial, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', { id: serial('id').primaryKey(), age: integer('age') });

export const posts = pgTable('posts', {
	id: serial('id')
});
