// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
	} // interface Error {}
	// interface Locals {
} //	user: (typeof auth.$Infer.Session)['user'] | null;
//	session: (typeof auth.$Infer.Session)['session'] | null;

// }
// interface PageData {}
// interface PageState {}
// interface Platform {}
export {};
