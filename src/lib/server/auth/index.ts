import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '../db';
import { BETTER_AUTH_SECRET } from '$env/static/private';

/**
 * Better Auth Configuration
 *
 * Minimal configuration with sensible defaults:
 * - Drizzle ORM adapter for PostgreSQL
 * - SvelteKit cookies plugin for automatic cookie handling
 * - Email/password authentication (enabled by default)
 *
 * Better Auth automatically handles:
 * - Password hashing (bcrypt, min 8 chars)
 * - Session management (7 day expiration)
 * - HTTP-only, secure cookies
 * - CSRF protection
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),

	secret: BETTER_AUTH_SECRET,

	// SvelteKit cookies plugin (must be last in plugins array)
	plugins: [sveltekitCookies(getRequestEvent)]
});

/**
 * Export type-safe auth instance
 */
export type Auth = typeof auth;
