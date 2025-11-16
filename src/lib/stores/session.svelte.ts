/**
 * Session Store
 *
 * Reactive store for managing user session state
 * Uses Svelte 5 runes for reactivity
 */

type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
} | null;

type Session = {
	id: string;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string;
	userAgent?: string;
} | null;

class SessionStore {
	user = $state<User>(null);
	session = $state<Session>(null);
	loading = $state(true);
	error = $state<string | null>(null);

	/**
	 * Set session data
	 */
	setSession(user: User, session: Session) {
		this.user = user;
		this.session = session;
		this.loading = false;
		this.error = null;
	}

	/**
	 * Clear session data
	 */
	clearSession() {
		this.user = null;
		this.session = null;
		this.loading = false;
		this.error = null;
	}

	/**
	 * Set loading state
	 */
	setLoading(loading: boolean) {
		this.loading = loading;
	}

	/**
	 * Set error state
	 */
	setError(error: string) {
		this.error = error;
		this.loading = false;
	}

	/**
	 * Check if user is authenticated
	 */
	get isAuthenticated(): boolean {
		return this.user !== null && this.session !== null;
	}
}

/**
 * Global session store instance
 */
export const sessionStore = new SessionStore();
