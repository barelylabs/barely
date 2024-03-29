import { eq } from 'drizzle-orm';

import type { Db } from './db';
import type { UserSession } from './user-session.schema';
import { UserSessions } from './user-session.sql';
import {
	deserializeUser,
	getSessionUserFromRawUser,
	rawSessionUserWith,
} from './user.fns';

export function deserializeUserSession(userSession: UserSession) {
	return {
		...userSession,
		expires: new Date(userSession.expires),
	};
}

export function serializeUserSession(userSession: {
	userId: string;
	sessionToken: string;
	expires: Date;
}) {
	return {
		...userSession,
		expires: userSession.expires.toISOString(),
	};
}

export async function getSessionAndUser(sessionToken: string, db: Db) {
	const sessionWithUser = await db.http.query.UserSessions.findFirst({
		where: eq(UserSessions.sessionToken, sessionToken),
		with: {
			user: {
				with: rawSessionUserWith,
			},
		},
	});

	if (!sessionWithUser) return null;

	return {
		session: deserializeUserSession(sessionWithUser),
		user: deserializeUser(getSessionUserFromRawUser(sessionWithUser.user)),
	};
}
