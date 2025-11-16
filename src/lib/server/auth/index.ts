import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '../db';
import { BETTER_AUTH_SECRET } from '$env/static/private';

/**
 * Better Auth Configuration
 *
 * Configured with:
 * - Drizzle ORM adapter for PostgreSQL
 * - SvelteKit cookies plugin for automatic cookie handling
 * - Email/password authentication
 * - Secure session management (HTTP-only cookies, CSRF protection)
 *
 * Better Auth automatically handles:
 * - Cookie signing and security
 * - Session expiration and refresh
 * - CSRF protection
 * - Password hashing (bcrypt)
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg' // PostgreSQL
	}),

	// Email and password authentication
	emailAndPassword: {
		enabled: true,
		// Password requirements
		minPasswordLength: 8,
		maxPasswordLength: 128
	},

	// Session configuration
	session: {
		// Session expiration (7 days)
		expiresIn: 60 * 60 * 24 * 7,
		// Update session on activity
		updateAge: 60 * 60 * 24 // Update once per day
	},

	// Security settings
	secret: BETTER_AUTH_SECRET,

	// Base URL (will be set from request in hooks)
	// In production, set this to your actual domain
	trustedOrigins: [
		'http://localhost:5173', // Local development
		'http://localhost:4173' // Preview mode
		// Add production URL here when deploying
	],

	// Advanced security options (Better Auth handles these automatically)
	advanced: {
		// Use secure cookies in production (HTTPS)
		useSecureCookies: process.env.NODE_ENV === 'production',
		// Generate CSRF tokens
		generateSessionToken: true
	},

	/**
	 * Plugins
	 * Note: sveltekitCookies must be the last plugin in the array
	 */
	plugins: [
		sveltekitCookies(getRequestEvent) // Automatically handles cookies in SvelteKit
	]
});

/**
 * Export type-safe auth instance
 * Use this to create the SvelteKit handler and client
 */
export type Auth = typeof auth;
