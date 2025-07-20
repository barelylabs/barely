import type { BetterAuthOptions } from 'better-auth';
import { eq } from '@barely/db';
import { dbHttp } from '@barely/db/client';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
	_Users_To_Workspaces,
	ProviderAccounts,
	Users,
	UserSessions,
	VerificationTokens,
} from '@barely/db/sql';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { customSession, magicLink, oAuthProxy } from 'better-auth/plugins';

import { authEnv } from '../env';
import { sendMagicLink } from './utils';

const devTrustedOrigins: string[] = [
	'expo://',
	authEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ?
		'https://localhost:' + authEnv.NEXT_PUBLIC_APP_DEV_PORT
	:	false,
	authEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ?
		'https://127.0.0.1:' + authEnv.NEXT_PUBLIC_APP_DEV_PORT
	:	false,
].filter(f => typeof f === 'string');

const previewTrustedOrigins: string[] = [
	authEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview' ?
		'https://' + authEnv.NEXT_PUBLIC_VERCEL_URL
	:	false,
].filter(f => typeof f === 'string');

export function initAuth(options: {
	baseUrl: string;
	productionUrl: string;
	secret: string | undefined;
}) {
	const config = {
		database: drizzleAdapter(dbHttp, {
			provider: 'pg',
			schema: {
				user: Users,
				account: ProviderAccounts,
				session: UserSessions,
				verification: VerificationTokens,
			},
			// debugLogs: true,™
		}),
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 60 * 5, // 5 minutes
			},
		},
		user: {
			fields: {
				name: 'fullName', // mapping better-auth user.name to db.Users.fullName
				// createdAt: 'created_at',
				// updatedAt: 'updated_at',
				// emailVerified: 'emailVerified',
			},
		},
		account: {
			fields: {
				providerId: 'provider',
				accountId: 'providerAccountId',
				refreshToken: 'refresh_token',
				accessToken: 'access_token',
				accessTokenExpiresAt: 'expires_at',
				idToken: 'id_token',
			},
		},
		baseURL: options.baseUrl,
		secret: options.secret,
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, token, url }) => {
					console.log('sendMagicLink', email, token, url);
					await sendMagicLink({ email, token });
				},
			}),
			oAuthProxy({
				/**
				 * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
				 */
				currentURL: options.baseUrl,
				productionURL: options.productionUrl,
			}),
			customSession(async ({ user, session }) => {
				const dbUser = await dbHttp.query.Users.findFirst({
					where: eq(Users.id, user.id),
					columns: {
						fullName: true,
						firstName: true,
						lastName: true,
						pitchScreening: true,
						pitchReviewing: true,
						phone: true,
					},
					with: {
						_workspaces: {
							with: {
								workspace: {
									columns: {
										id: true,
										name: true,
										handle: true,
										plan: true,
										type: true,
										timezone: true,
										spotifyArtistId: true,
										stripeCustomerId: true,
										stripeCustomerId_devMode: true,
										// stripeConnectAccountId: true,
										// stripeConnectAccountId_devMode: true,
										// shippingAddressPostalCode: true,
										// cartSupportEmail: true,
										// linkUsage: true,
										// linkUsageLimit: true,
									},
									with: {
										_avatarImages: {
											where: () => eq(_Files_To_Workspaces__AvatarImage.current, true),
											with: {
												file: {
													columns: {
														s3Key: true,
													},
												},
											},
											limit: 1,
										},
										_headerImages: {
											where: () => eq(_Files_To_Workspaces__HeaderImage.current, true),
											with: {
												file: {
													columns: {
														s3Key: true,
													},
												},
											},
											limit: 1,
										},
									},
								},
							},
						},
						workspaceInvites: true,
					},
				});

				if (!dbUser) {
					throw new Error('User not found');
				}

				const workspaces = dbUser._workspaces.map(({ workspace, role }) => ({
					...workspace,
					avatarImageS3Key: workspace._avatarImages[0]?.file.s3Key,
					headerImageS3Key: workspace._headerImages[0]?.file.s3Key,
					role,
				}));

				const personalWorkspace = workspaces.find(({ type }) => type === 'personal');

				if (!personalWorkspace) {
					throw new Error('Personal workspace not found');
				}

				return {
					...session,
					user: {
						...user,
						fullName: dbUser.fullName,
						firstName: dbUser.firstName,
						lastName: dbUser.lastName,
						handle: personalWorkspace.handle,
						avatarImageS3Key: personalWorkspace.avatarImageS3Key,
						workspaces,
						pitchScreening: dbUser.pitchScreening,
						pitchReviewing: dbUser.pitchReviewing,
						workspaceInvites: dbUser.workspaceInvites,
						phone: dbUser.phone,
					},

					workspaces,
				};
			}, options), // <- i think include options here is for custom session type reference
		],
		socialProviders: {},
		trustedOrigins: [...devTrustedOrigins, ...previewTrustedOrigins],
	} satisfies BetterAuthOptions;

	return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export type SessionUser = Session['user'];
export type SessionWorkspaces = Session['workspaces'];
export type SessionWorkspace = SessionWorkspaces[number];
