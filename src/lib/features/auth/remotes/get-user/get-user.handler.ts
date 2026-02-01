import type { User } from 'better-auth';

export default async function getUserHandler(): Promise<User | null> {
	const { getRequestEvent } = await import('$app/server');
	const { locals } = getRequestEvent();

	return locals?.user ?? null;
}
