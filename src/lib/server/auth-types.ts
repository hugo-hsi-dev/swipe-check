import type { Session } from '$lib/server/db/schema';

export type AuthResult<T = void> = { success: true; data: T } | { success: false; error: string };

export type SessionValidationResult = {
	session: Session | null;
	user: { id: string; username: string; email: string } | null;
};
