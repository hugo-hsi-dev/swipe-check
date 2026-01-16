import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { verifyPassword, hashPassword } from '$lib/server/password';
import type { RequestEvent } from '@sveltejs/kit';
import type { AuthResult, SessionValidationResult } from './auth-types';

export type { AuthResult, SessionValidationResult };

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export class AuthService {
	constructor(private database: typeof db) {}

	async register(data: {
		email: string;
		username: string;
		password: string;
	}): Promise<AuthResult<{ userId: string }>> {
		try {
			const passwordHash = await hashPassword(data.password);
			const bytes = crypto.getRandomValues(new Uint8Array(12));
			const userId = encodeBase64url(bytes);

			await this.database.insert(table.user).values({
				id: userId,
				email: data.email.toLowerCase(),
				username: data.username.toLowerCase(),
				passwordHash: passwordHash
			});

			return { success: true, data: { userId } };
		} catch (error) {
			const message = error instanceof Error ? error.message : '';
			if (message.includes('unique') || message.includes('duplicate')) {
				if (message.includes('email')) {
					return { success: false, error: 'Email already exists' };
				}
				if (message.includes('username')) {
					return { success: false, error: 'Username already exists' };
				}
				return { success: false, error: 'User already exists' };
			}
			console.error('Registration error:', error);
			return { success: false, error: 'Registration failed' };
		}
	}

	async login(
		email: string,
		password: string
	): Promise<AuthResult<{ token: string; session: table.Session }>> {
		try {
			const [user] = await this.database
				.select()
				.from(table.user)
				.where(eq(table.user.email, email.toLowerCase()))
				.limit(1);

			if (!user) {
				return { success: false, error: 'Invalid email or password' };
			}

			const validPassword = await verifyPassword(user.passwordHash, password);
			if (!validPassword) {
				return { success: false, error: 'Invalid email or password' };
			}

			const token = this.generateSessionToken();
			const session = await this.createSession(token, user.id);

			return { success: true, data: { token, session } };
		} catch (error) {
			console.error('Login error:', error);
			return { success: false, error: 'Login failed' };
		}
	}

	async logout(event: RequestEvent): Promise<AuthResult> {
		const token = event.cookies.get(sessionCookieName);
		if (!token) {
			return { success: true, data: undefined };
		}

		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		await this.invalidateSession(sessionId);
		this.deleteSessionCookie(event);

		return { success: true, data: undefined };
	}

	async validateSession(token: string): Promise<SessionValidationResult> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const [result] = await this.database
			.select({
				user: { id: table.user.id, username: table.user.username, email: table.user.email },
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
			await this.database.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}

		const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
		if (renewSession) {
			session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
			await this.database
				.update(table.session)
				.set({ expiresAt: session.expiresAt })
				.where(eq(table.session.id, session.id));
		}

		return { session, user };
	}

	generateSessionToken(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(18));
		return encodeBase64url(bytes);
	}

	async createSession(token: string, userId: string): Promise<table.Session> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const session: table.Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
		};
		await this.database.insert(table.session).values(session);
		return session;
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.database.delete(table.session).where(eq(table.session.id, sessionId));
	}

	setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
		event.cookies.set(sessionCookieName, token, {
			expires: expiresAt,
			path: '/'
		});
	}

	deleteSessionCookie(event: RequestEvent): void {
		event.cookies.delete(sessionCookieName, {
			path: '/'
		});
	}
}

export const authService = new AuthService(db);
