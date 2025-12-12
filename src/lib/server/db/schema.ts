import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import type z from 'zod';
import { user } from './auth-schema';
import type { User } from '$lib/features/auth/types';

export const placeholder = pgTable('placeholder', {
	id: serial('id').primaryKey().$type<number & z.core.$brand<'placeholder.id'>>(),
	name: text('name').$type<string & z.core.$brand<'placeholder.name'>>(),
	userId: text('user_id')
		.references(() => user.id)
		.notNull()
		.$type<User['id']>()
});
