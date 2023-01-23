import { type NextAuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import SpotifyProvider from 'next-auth/providers/spotify';
import env from './env';

import { Magic } from '@magic-sdk/admin';
const magic = new Magic(env.MAGIC_SECRET_KEY);

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
	pages: {
		signIn: '/signin',
	},
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID as string,
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
		}),
		SpotifyProvider({
			clientId: process.env.SPOTIFY_CLIENT_ID as string,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
			authorization: `https://accounts.spotify.com/authorize?scope=${spotifyAuthScopes.join(
				'%20',
			)}&response_type=code&show_dialog=true`,
		}),
		CredentialsProvider({
			name: 'Login with Email',
			credentials: { token: { label: 'Token', type: 'text' } },
			async authorize(credentials, req) {
				if (!credentials?.token) return null;
				const loginToken = await prisma.loginToken.findFirst({
					where: {
						token: credentials.token,
					},
					include: {
						user: true,
					},
				});
				if (!loginToken) return null;
				if (loginToken.expiresAt < new Date()) return null;
				return loginToken.user;
				// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
			},
		}),
	],
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
};
