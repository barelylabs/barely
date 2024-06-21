import { eq } from 'drizzle-orm';

import type { UserSession } from './user-session.schema';
import { dbHttp } from '../../db';
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

export async function getSessionAndUser(sessionToken: string) {
	const sessionWithUser = await dbHttp.query.UserSessions.findFirst({
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
