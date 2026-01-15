import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

/**
 * Core Authentication Service following SOLID principles.
 */
export const AuthService = {
	/**
	 * Creates a new user in the database.
	 */
	async createUser(data: { email: string; username: string; passwordHash: string }) {
		const bytes = crypto.getRandomValues(new Uint8Array(12));
		const userId = encodeBase64url(bytes);

		await db.insert(table.user).values({
			id: userId,
			email: data.email.toLowerCase(),
			username: data.username.toLowerCase(),
			passwordHash: data.passwordHash
		});

		return { id: userId };
	},

	/**
	 * Finds a user by email.
	 */
	async findUserByEmail(email: string) {
		const [user] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, email.toLowerCase()))
			.limit(1);
		return user || null;
	},

	/**
	 * Session management logic.
	 */
	session: {
		generateToken() {
			const bytes = crypto.getRandomValues(new Uint8Array(18));
			return encodeBase64url(bytes);
		},

		async create(token: string, userId: string) {
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
			const session: table.Session = {
				id: sessionId,
				userId,
				expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
			};
			await db.insert(table.session).values(session);
			return session;
		},

		async validate(token: string): Promise<SessionValidationResult> {
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
			const [result] = await db
				.select({
					user: { id: table.user.id, username: table.user.username },
					session: table.session
				})
				.from(table.session)
				.innerJoin(table.user, eq(table.session.userId, table.user.id))
				.where(eq(table.session.id, sessionId));

			if (!result) {
				return { session: null, user: null };
			}

			const { session, user } = result;
			const sessionExpired = Date.now() >= session.expiresAt.getTime();

			if (sessionExpired) {
				await db.delete(table.session).where(eq(table.session.id, session.id));
				return { session: null, user: null };
			}

			const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
			if (renewSession) {
				session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
				await db
					.update(table.session)
					.set({ expiresAt: session.expiresAt })
					.where(eq(table.session.id, session.id));
			}

			return { session, user };
		},

		async invalidate(sessionId: string) {
			await db.delete(table.session).where(eq(table.session.id, sessionId));
		},

		setCookie(event: RequestEvent, token: string, expiresAt: Date) {
			event.cookies.set(sessionCookieName, token, {
				expires: expiresAt,
				path: '/'
			});
		},

		deleteCookie(event: RequestEvent) {
			event.cookies.delete(sessionCookieName, {
				path: '/'
			});
		}
	}
};

export type SessionValidationResult = {
	session: table.Session | null;
	user: { id: string; username: string } | null;
};

// Deprecated: Keeping old exports for backward compatibility during migration
/** @deprecated Use AuthService.session.generateToken */
export const generateSessionToken = AuthService.session.generateToken;
/** @deprecated Use AuthService.session.create */
export const createSession = AuthService.session.create;
/** @deprecated Use AuthService.session.validate */
export const validateSessionToken = AuthService.session.validate;
/** @deprecated Use AuthService.session.invalidate */
export const invalidateSession = AuthService.session.invalidate;
/** @deprecated Use AuthService.session.setCookie */
export const setSessionTokenCookie = AuthService.session.setCookie;
/** @deprecated Use AuthService.session.deleteCookie */
export const deleteSessionTokenCookie = AuthService.session.deleteCookie;
