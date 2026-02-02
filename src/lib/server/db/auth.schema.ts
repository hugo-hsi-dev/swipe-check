import { index, pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	emailVerified: boolean().notNull().default(false),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.$onUpdate(() => new Date())
		.defaultNow(),
	email: text().notNull().unique(),
	isAnonymous: boolean().default(false),
	name: text().notNull(),
	id: text().primaryKey(),
	image: text()
});

export const session = pgTable(
	'session',
	{
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		expiresAt: timestamp().notNull(),
		ipAddress: text(),
		userAgent: text(),
		id: text().primaryKey(),
		token: text().notNull().unique(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date())
			.defaultNow()
	},
	(table) => [index('session_user_id_idx').on(table.userId)]
);

export const account = pgTable(
	'account',
	{
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		providerId: text().notNull(),
		accountId: text().notNull(),
		refreshToken: text(),
		expiresAt: timestamp(),
		accessToken: text(),
		id: text().primaryKey(),
		password: text(),
		idToken: text(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date())
			.defaultNow()
	},
	(table) => [index('account_user_id_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		expiresAt: timestamp().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		id: text().primaryKey(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.$onUpdate(() => new Date())
			.defaultNow()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);
