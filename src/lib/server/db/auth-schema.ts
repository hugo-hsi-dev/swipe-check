// Auth-related Drizzle schema for Better Auth.
// This file is intended to be managed by the Better Auth CLI.
// Initially empty; after running `npx @better-auth/cli@latest generate`,
// the generated auth tables (user, account, session, verification, etc.)
// should live here.

import * as auth from '../../../../auth-schema';

export const {
	user,
	session,
	account,
	verification,
	userRelations,
	sessionRelations,
	accountRelations
} = auth;
