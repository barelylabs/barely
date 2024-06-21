import type { DefaultSession, NextAuthConfig } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';

import type { User as DbUser, User_To_Workspace } from '../routes/user/user.schema';
import type { Workspace } from '../routes/workspace/workspace.schema';
import { dbHttp } from '../db';

export interface SessionWorkspace extends Workspace {
	role: User_To_Workspace['role'];
	avatarImageUrl?: string;
	headerImageUrl?: string;
}

export interface SessionUser extends DbUser {
	workspaces: SessionWorkspace[];
}

declare module 'next-auth' {
	interface Session extends DefaultSession {
		id: string;
		user: SessionUser;
	}
}
export type { Session } from 'next-auth';

export const authConfig: NextAuthConfig = {
	adapter: DrizzleAdapter(dbHttp),
	providers: [Discord],
	callbacks: {
		session: opts => {
			if (!('user' in opts)) throw 'unreachable with session strategy';

			return {
				...opts.session,
				user: {
					...opts.session.user,
					id: opts.user.id,
				},
			};
		},
	},
};

const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authConfig);

export { GET, POST, auth, signIn, signOut };
