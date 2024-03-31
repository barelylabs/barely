import type { DefaultSession } from '@auth/core/types';
import NextAuth from 'next-auth';

import type { User as DbUser, User_To_Workspace } from '../routes/user/user.schema';
import type { Workspace } from '../routes/workspace/workspace.schema';
import { env } from '../../env';
import { db } from '../db';
import { NeonAdapter } from './auth.adapter';
import { generateVerificationToken, sendLoginEmail } from './auth.fns';
import Spotify from './auth.spotify';

//* 🧫 CUSTOM TYPES 🧫 *//

export type { NextAuthRequest } from 'next-auth/lib';

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

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
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
		// signIn: async ({ user, account, profile }) => {
		// 	console.log({ user, account, profile });
		// 	// if (!user.email || (await isBlacklistedEmail(user.email))) {
		// 	// 	return false;
		// 	// }
		// 	if (account?.provider === 'google' || account?.provider === 'github') {
		// 		const userExists = await prisma.user.findUnique({
		// 			where: { email: user.email },
		// 			select: { id: true, name: true, image: true },
		// 		});
		// 		if (!userExists || !profile) {
		// 			return true;
		// 		}
		// 		// if the user already exists via email,
		// 		// update the user with their name and image
		// 		if (userExists && profile) {
		// 			const profilePic =
		// 				profile[account.provider === 'google' ? 'picture' : 'avatar_url'];
		// 			let newAvatar: string | null = null;
		// 			// if the existing user doesn't have an image or the image is not stored in R2
		// 			if ((!userExists.image || !isStored(userExists.image)) && profilePic) {
		// 				const { url } = await storage.upload(`avatars/${userExists.id}`, profilePic);
		// 				newAvatar = url;
		// 			}
		// 			await prisma.user.update({
		// 				where: { email: user.email },
		// 				data: {
		// 					// @ts-expect-error - this is a bug in the types, `login` is a valid on the `Profile` type
		// 					...(!userExists.name && { name: profile.name || profile.login }),
		// 					...(newAvatar && { image: newAvatar }),
		// 				},
		// 			});
		// 		}
		// 	} else if (account?.provider === 'saml' || account?.provider === 'saml-idp') {
		// 		let samlProfile;

		// 		if (account?.provider === 'saml-idp') {
		// 			// @ts-ignore
		// 			samlProfile = user.profile;
		// 			if (!samlProfile) {
		// 				return true;
		// 			}
		// 		} else {
		// 			samlProfile = profile;
		// 		}

		// 		if (!samlProfile?.requested?.tenant) {
		// 			return false;
		// 		}
		// 		const workspace = await prisma.project.findUnique({
		// 			where: {
		// 				id: samlProfile.requested.tenant,
		// 			},
		// 		});
		// 		if (workspace) {
		// 			await Promise.allSettled([
		// 				// add user to workspace
		// 				prisma.projectUsers.upsert({
		// 					where: {
		// 						userId_projectId: {
		// 							projectId: workspace.id,
		// 							userId: user.id,
		// 						},
		// 					},
		// 					update: {},
		// 					create: {
		// 						projectId: workspace.id,
		// 						userId: user.id,
		// 					},
		// 				}),
		// 				// delete any pending invites for this user
		// 				prisma.projectInvite.delete({
		// 					where: {
		// 						email_projectId: {
		// 							email: user.email,
		// 							projectId: workspace.id,
		// 						},
		// 					},
		// 				}),
		// 			]);
		// 		}
		// 	}
		// 	return true;
		// },
		session: ({ session, user }) => {
			return { ...session, user };
		},
	},
});
