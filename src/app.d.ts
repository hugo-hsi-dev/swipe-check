// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { auth } from '$lib/server/auth';

/**
 * Infer session types from Better Auth configuration
 * This ensures types stay in sync when adding plugins or updating config
 */
type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/**
			 * User from Better Auth session
			 * Types inferred from auth configuration
			 */
			user: SessionData['user'];

			/**
			 * Session from Better Auth
			 * Types inferred from auth configuration
			 */
			session: SessionData['session'];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
