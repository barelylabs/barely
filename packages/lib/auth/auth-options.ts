import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { DefaultSession, NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import SpotifyProvider from 'next-auth/providers/spotify';

import {
	prisma,
	type Account as DbAccount,
	type User as DbUser,
	type UserType,
} from '@barely/db';

import { syncSpotifyAccountUser } from '../api/spotify/spotify.node.fns';
import env from '../env';
import { fullName } from '../utils/edge/name';

//* 🧫 CUSTOM TYPES 🧫 *//

export type SessionUser = Pick<
	DbUser,
	| 'id'
	| 'firstName'
	| 'lastName'
	| 'fullName'
	| 'email'
	| 'phone'
	| 'image'
	| 'type'
	| 'pitchScreening'
	| 'pitchReviewing'
	| 'stripeId'
>;

declare module 'next-auth' {
	interface Session extends DefaultSession {
		id: string;
		user: SessionUser;
	}
	interface User extends DbUser {}
	interface Account extends DbAccount {}
}

//* 🎛 AUTH OPTIONS 🎛 *//

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),

	secret: env.NEXTAUTH_SECRET,

	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},

	pages: {
		signIn: '/login',
		signOut: '/logout',
		newUser: '/register',
		error: '/login',
	},

	callbacks: {
		async jwt({ token, user, account }) {
			if (user) {
				console.log('jwt callback user: ', user);
				token.id = user.id;
				token.email = user.email;
				token.phone = user.phone;
				token.firstName = user.firstName ?? '';
				token.lastName = user.lastName ?? '';
				token.fullName = user.fullName ?? fullName(user.firstName, user.lastName);
				token.image = user.image;
				token.type = user.type;
				token.pitchScreening = user.pitchScreening;
				token.pitchReviewing = user.pitchReviewing;
				token.stripeId = user.stripeId;
				// token.sessionId = randomUUID();
			}

			if (account?.provider === 'spotify') {
				await syncSpotifyAccountUser({
					accountSpotifyId: account.providerAccountId,
				});

				// trigger syncing playlists, but don't wait for it to finish. otherwise, the user hangs on the spotify auth screen which is confusing
				const syncPlaylistsEndpoint = `${env.NEXT_PUBLIC_APP_BASE_URL}/api/rest/spotify/sync-playlists/${account.providerAccountId}`;

				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				fetch(syncPlaylistsEndpoint, {
					method: 'POST',
				});

				// TODO - add auth token to request. something like this: https://github.com/jlalmes/trpc-openapi/blob/master/examples/with-nextjs/src/server/router.ts
			}

			return token;
		},

		session({ session, user, token }) {
			console.log('session callback user: ', user);
			if (session.user) {
				console.log('session callback session.user: ', session.user);
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.phone = token.phone as string;
				session.user.firstName = token.firstName as string;
				session.user.lastName = token.lastName as string;
				session.user.fullName = token.fullName as string;
				session.user.image = token.image as string;
				session.user.type = token.type as UserType;
				session.user.pitchScreening = token.pitchScreening as boolean;
				session.user.pitchReviewing = token.pitchReviewing as boolean;
				session.user.stripeId = token.stripeId as string;
			}
			return session;
		},
	},

	providers: [
		EmailProvider({
			maxAge: 30 * 24 * 60 * 60, // 30 days
			// sendVerificationRequest({ identifier: email, url }) {
			// 	// sendLoginEmail({ email, url }).catch(err => {
			// 	// 	throw new Error(err as string);
			// 	// });
			// },
		}),
		SpotifyProvider({
			clientId: env.SPOTIFY_CLIENT_ID,
			clientSecret: env.SPOTIFY_CLIENT_SECRET,
			authorization: {
				url: 'https://accounts.spotify.com/authorize',
				params: {
					scope:
						'ugc-image-upload user-modify-playback-state user-read-playback-state user-modify-playback-state user-read-currently-playing user-follow-modify user-follow-read user-read-recently-played user-read-playback-position user-top-read playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private app-remote-control streaming user-read-email user-read-private user-library-modify user-library-read',
					show_dialog: true,
				},
			},
		}),
	],
};

//** 🎰 HELPER FUNCTIONS 🎰 *//

// async function sendLoginEmail({ email, url }: { email: string; url: string }) {
// 	await sendEmail({
// 		to: email,
// 		from: 'barely.io <support@barely.io>',
// 		subject: 'Barely Login Link',
// 		text: `Barely login link is ${url}`,
// 		type: 'transactional',
// 		html: '',
// 	});
// }

// const syncSpotifyUser = async ({ spotifyAccountId }: { spotifyAccountId: string }) => {
// 	// mock async function by wait to console.log
// 	await new Promise(resolve => setTimeout(resolve, 1000));
// 	return console.log('syncSpotifyUser: ', spotifyAccountId);
// };
