import { timestamp, pgTable, integer, boolean, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	emailVerified: boolean('emailVerified').notNull().default(false),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().defaultNow(),
	email: text('email').notNull().unique(),
	isAnonymous: boolean('isAnonymous'),
	name: text('name').notNull(),
	id: text('id').primaryKey(),
	image: text('image')
});

export const session = pgTable('session', {
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	id: text('id').primaryKey()
});

export const account = pgTable('account', {
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	providerId: text('providerId').notNull(),
	accountId: text('accountId').notNull(),
	refreshToken: text('refreshToken'),
	expiresAt: timestamp('expiresAt'),
	accessToken: text('accessToken'),
	id: text('id').primaryKey(),
	password: text('password'),
	idToken: text('idToken')
});

export const verification = pgTable('verification', {
	expiresAt: timestamp('expiresAt').notNull(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	id: text('id').primaryKey()
});
