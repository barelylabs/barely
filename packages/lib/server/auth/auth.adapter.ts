import type { Adapter } from '@auth/core/adapters';
import { and, eq } from 'drizzle-orm';

import { newId } from '../../utils/id';
import { raise } from '../../utils/raise';
import { dbHttp } from '../db';
import {
	deserializeVerificationToken,
	serializeVerificationToken,
} from '../routes/auth/verification-token.fns';
import { VerificationTokens } from '../routes/auth/verification-token.sql';
import { insertProviderAccountSchema } from '../routes/provider-account/provider-account.schema';
import { ProviderAccounts } from '../routes/provider-account/provider-account.sql';
import {
	deserializeUserSession,
	getSessionAndUser,
	serializeUserSession,
} from '../routes/user/user-session.fns';
import { UserSessions } from '../routes/user/user-session.sql';
import {
	createUser,
	deserializeUser,
	getSessionUserByAccount,
	getSessionUserByEmail,
	getSessionUserByUserId,
	serializeUser,
} from '../routes/user/user.fns';
import { Users } from '../routes/user/user.sql';
import { getSpotifyUser } from '../spotify/spotify.endpts.user';
import { deleteSession } from './auth.fns';

export function NeonAdapter(): Adapter {
	return {
		createUser: async userData => {
			const newUser = await createUser(
				{
					...userData,
					emailVerified:
						userData.emailVerified ? userData.emailVerified.toISOString() : null,
				},
				// db.pool,
			);

			const user = await getSessionUserByUserId(newUser.id);

			if (!user) {
				throw new Error('No user found after creating user');
			}

			return deserializeUser(user);
		},

		getUser: async userId => {
			const user = await getSessionUserByUserId(userId);

			if (!user) return null;

			return deserializeUser(user);
		},

		getUserByEmail: async email => {
			// console.log('getting user by email: ', email);

			const user = await getSessionUserByEmail(email);

			if (!user) return null;

			return deserializeUser(user);
		},

		getUserByAccount: async account => {
			const provider = insertProviderAccountSchema.shape.provider.safeParse(
				account.provider,
			);

			if (!provider.success) {
				throw new Error('Invalid provider');
			}

			const user = await getSessionUserByAccount(
				provider.data,
				account.providerAccountId,
			);

			if (!user) return null;

			return deserializeUser(user);
		},

		updateUser: async userData => {
			if (!userData.id) {
				throw new Error('No user id');
			}

			await dbHttp
				.update(Users)
				.set(serializeUser(userData))
				.where(eq(Users.id, userData.id));

			const user = await getSessionUserByUserId(userData.id);

			if (!user) {
				throw new Error('No updated user found');
			}

			return deserializeUser(user);
		},

		deleteUser: async id => {
			await dbHttp.delete(Users).where(eq(Users.id, id));
		},

		linkAccount: async account => {
			// console.log("linking account => ", account);
			const type = insertProviderAccountSchema.shape.type.safeParse(account.type);

			if (!type.success) {
				throw new Error('Invalid account type');
			}

			const provider = insertProviderAccountSchema.shape.provider.safeParse(
				account.provider,
			);

			if (!provider.success) {
				throw new Error('Invalid provider');
			}

			// get user by id
			const user = await getSessionUserByUserId(account.userId);

			if (!user) {
				throw new Error('No user found after linking account');
			}

			const personalWorkspace =
				user.workspaces.find(w => w.type === 'personal') ??
				raise('No personal workspace found');

			// await db.pool.transaction(async tx => {
			await dbHttp.insert(ProviderAccounts).values({
				...account,
				type: type.data,
				provider: provider.data,
				id: newId('providerAccount'),
				workspaceId: personalWorkspace.id,
			});

			if (account.provider === 'spotify' && account.access_token) {
				const spotifyUser = await getSpotifyUser({
					accessToken: account.access_token,
				});

				// console.log("spotifyUser => ", spotifyUser);

				await dbHttp
					.update(ProviderAccounts)
					.set({
						username: spotifyUser.display_name,
						email: spotifyUser.email,
						image: spotifyUser.images?.[0]?.url,
						externalProfileUrl: spotifyUser.external_urls.spotify,
					})
					.where(eq(ProviderAccounts.providerAccountId, account.providerAccountId));

				// trigger syncing playlists, but don't wait for it to finish. otherwise, the user hangs on the spotify auth screen which is confusing
				// const syncPlaylistsEndpoint = `${env.NEXT_PUBLIC_APP_BASE_URL}/api/rest/spotify/sync-playlists/${account.providerAccountId}`;

				// // eslint-disable-next-line @typescript-eslint/no-floating-promises
				// fetch(syncPlaylistsEndpoint, {
				//   method: "POST",
				// }); //fixme: was having trouble with open-api. figure out how to call separate instance to sync playlists in the background.
			}
			// });
		},

		unlinkAccount: async account => {
			const provider = insertProviderAccountSchema.shape.provider.safeParse(
				account.provider,
			);

			if (!provider.success) {
				throw new Error('Invalid provider');
			}

			await dbHttp
				.delete(ProviderAccounts)
				.where(
					and(
						eq(ProviderAccounts.provider, provider.data),
						eq(ProviderAccounts.providerAccountId, account.providerAccountId),
					),
				);
		},

		createVerificationToken: async token => {
			await dbHttp
				.insert(VerificationTokens)
				.values({ ...serializeVerificationToken(token) });

			const verificationToken = await dbHttp
				.select()
				.from(VerificationTokens)
				.where(eq(VerificationTokens.token, token.token))
				.then(tokens => tokens[0]);

			if (!verificationToken) return null;
			return deserializeVerificationToken(verificationToken);
		},

		useVerificationToken: async token => {
			try {
				// console.log("using verification token => ", token);

				const deletedToken =
					(await dbHttp
						.select()
						.from(VerificationTokens)
						.where(
							and(
								eq(VerificationTokens.identifier, token.identifier),
								eq(VerificationTokens.token, token.token),
							),
						)
						.then(res => res[0])) ?? null;

				if (!deletedToken) {
					return null;
				}
				// todo: decide on how we want to delete token. Maybe we can just wait until it expires?

				// await client
				// 	.delete(verificationToken)
				// 	.where(
				// 		and(
				// 			eq(verificationToken.identifier, token.identifier),
				// 			eq(verificationToken.token, token.token),
				// 		),
				// 	);

				return deserializeVerificationToken(deletedToken);
			} catch (e) {
				throw new Error('No verification token found.');
			}
		},

		createSession: async sessionData => {
			// console.log("creating session => ", sessionData);
			await dbHttp.insert(UserSessions).values(serializeUserSession(sessionData));

			const session = await dbHttp
				.select()
				.from(UserSessions)
				.where(eq(UserSessions.sessionToken, sessionData.sessionToken))
				.then(sessions => sessions[0]);

			if (!session) throw new Error('No session found');

			return deserializeUserSession(session);
		},

		getSessionAndUser: async sessionToken => {
			// console.log('getting session and user w/ sessionToken: ', sessionToken);

			// const sessionWithUser = await db.http.query.UserSessions.findFirst({
			//   where: eq(UserSessions.sessionToken, sessionToken),
			//   with: {
			//     user: {
			//       with: userWith,
			//     },
			//   },
			// });

			// if (!sessionWithUser) return null;

			// // console.log('sessionWithUserAndWorkspaces: ', sessionUser);

			// const sessionAndUser = {
			//   session: deserializeUserSession(sessionWithUser),
			//   user: deserializeUser(sessionUser),
			// };
			// // console.log('returning session and user => ', sessionAndUser);

			// return sessionAndUser;
			return await getSessionAndUser(sessionToken);
		},

		updateSession: async sessionData => {
			// console.log("updating session => ", sessionData);
			await dbHttp
				.update(UserSessions)
				.set({
					...sessionData,
					expires: sessionData.expires?.toISOString(),
				})
				.where(eq(UserSessions.sessionToken, sessionData.sessionToken));

			const session = await dbHttp
				.select()
				.from(UserSessions)
				.where(eq(UserSessions.sessionToken, sessionData.sessionToken))
				.then(res => res[0]);

			if (!session) throw new Error('No session found');

			return deserializeUserSession(session);
		},

		deleteSession: async sessionToken => {
			await deleteSession(sessionToken);
		},
	};
}
