import { timestamp, pgTable, text } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	name: text('name').notNull(),
	id: text('id').primaryKey()
});
