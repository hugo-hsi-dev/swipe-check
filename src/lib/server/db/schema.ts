import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const placeholder = pgTable('placeholder', {
	id: serial('id').primaryKey(),
	name: text('name')
});
