import type { session, user } from '$lib/server/db/auth-schema';
import type { Prettify } from '$lib/types';
import type z from 'zod';

type BaseUser = typeof user.$inferSelect;
type BaseSession = typeof session.$inferSelect;

type BrandHelper<T extends Record<string, unknown>, K extends string> = {
	[key in keyof T]: T[key] extends infer U
		? null extends U
			? NonNullable<U> extends never
				? T[key]
				: key extends string
					? (NonNullable<U> & z.$brand<`${K}.${key}`>) | null
					: T[key]
			: key extends string
				? T[key] & z.$brand<`${K}.${key}`>
				: T[key]
		: T[key];
};

export type User = Prettify<BrandHelper<BaseUser, 'user'>>;

export type Session = Prettify<BrandHelper<BaseSession, 'session'>>;
