import type { DefaultSession } from '@auth/core/types';
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';

import type { User as DbUser, User_To_Workspace } from '../routes/user/user.schema';
import type { Workspace } from '../routes/workspace/workspace.schema';
import { env } from '../../env';
import { db } from '../db';
import { NeonAdapter } from './auth.adapter';
import { generateVerificationToken, sendLoginEmail } from './auth.fns';
import Spotify from './auth.spotify';

//* 🧫 CUSTOM TYPES 🧫 *//

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

//* 🎛 AUTH OPTIONS 🎛 *//
const authConfig: NextAuthConfig = {
	adapter: NeonAdapter(db),

	secret: env.NEXTAUTH_SECRET,

	session: {
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},

	pages: {
		signIn: '/login',
		signOut: '/logout',
		newUser: '/register',
		error: '/login',
	},

	providers: [
		/** 
		fixme: I wasn't able to get the custom email provider to work 
		without having id = 'email' and providing server, from, maxAge, options...
		
		in theory, this should work: https://authjs.dev/guides/providers/email-http
		 */
		{
			id: 'email',
			type: 'email',
			name: 'Email',
			server: '',
			from: 'support@barely.io',
			maxAge: 24 * 60 * 60,
			options: {},
			async sendVerificationRequest({ identifier: email, url: callbackUrl }) {
				await sendLoginEmail({ email, callbackUrl }).catch(err => {
					throw new Error(err as string);
				});
			},
			generateVerificationToken,
		},

		Spotify({
			clientId: env.SPOTIFY_CLIENT_ID,
			clientSecret: env.SPOTIFY_CLIENT_SECRET,
		}),
	],

	callbacks: {
		session: ({ session, user }) => {
			return { ...session, user };
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
