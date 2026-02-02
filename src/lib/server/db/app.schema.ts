import { timestamp, pgTable, text } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
	createdAt: timestamp().notNull().defaultNow(),
	id: text().primaryKey(),
	name: text().notNull()
});
