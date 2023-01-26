import { Session, type NextAuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import SpotifyProvider from 'next-auth/providers/spotify';
import env from './env';

import { prisma } from '@barely/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

// https://developer.spotify.com/documentation/general/guides/authorization/scopes
const spotifyAuthScopes = [
	'ugc-image-upload',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'app-remote-control',
	'streaming',
	'playlist-read-private',
	'playlist-read-collaborative',
	'playlist-modify-public',
	'playlist-modify-private',
	'user-read-email',
	'user-read-private',
];

export const authOptions: NextAuthOptions = {
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
		updateAge: 24 * 60 * 60, // 24 hours
	},
	secret: env.NEXTAUTH_SECRET,
	pages: {
		signIn: '/sign-in',
		newUser: '/register',
		error: '/signin',
	},
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		SpotifyProvider({
			clientId: env.SPOTIFY_CLIENT_ID,
			clientSecret: env.SPOTIFY_CLIENT_SECRET,
			authorization: `https://accounts.spotify.com/authorize?scope=${spotifyAuthScopes.join(
				'%20',
			)}&response_type=code&show_dialog=true`,
		}),
		CredentialsProvider({
			name: 'Login with Email',
			credentials: { token: { label: 'Token', type: 'text' } },
			async authorize(credentials, req) {
				if (!credentials?.token) return null;
				// const loginToken = await prisma.loginToken.findFirst({
				// 	where: {
				// 		token: credentials.token,
				// 	},
				// 	include: {
				// 		user: true,
				// 	},
				// });
				// if (!loginToken) throw new Error('Invalid token');
				// if (loginToken.expiresAt < new Date())
				// 	throw new Error('Sorry, that link has expired.');

				// console.log('loginToken.user', loginToken.user);

				// const sessionUser: Session['user'] = {
				// 	id: loginToken.user.id,
				// 	name: loginToken.user.name,
				// 	email: loginToken.user.email,
				// 	image: loginToken.user.image,
				// };
				// return sessionUser;
				return null;
				// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.email = user.email;
			}
			return token;
		},
		session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
};
