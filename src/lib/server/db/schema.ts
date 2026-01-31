import { pgTable, serial, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', { id: serial().primaryKey(), age: integer() });

export const posts = pgTable('posts', {
	id: serial()
});
