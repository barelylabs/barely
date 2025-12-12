import type { PlanType, WorkspaceTimezone } from '@barely/const';
import type { BrandKit } from '@barely/db/sql';
import type { BetterAuthOptions } from 'better-auth';
import { dbHttp } from '@barely/db/client';
import {
	ProviderAccounts,
	Users,
	UserSessions,
	VerificationTokens,
} from '@barely/db/sql';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, oAuthProxy } from 'better-auth/plugins';

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
				sendMagicLink: async ({ email, token }) => {
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
			// NOTE: customSession was removed to improve auth performance.
			// Workspace data is now fetched in tRPC workspaceProcedure instead.
		],
		socialProviders: {},
		trustedOrigins: [...devTrustedOrigins, ...previewTrustedOrigins],
	} satisfies BetterAuthOptions;

	return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export type SessionUser = Session['user'];

/**
 * SessionWorkspace type - workspace data with brandKit and images.
 * This data is now fetched in tRPC workspaceProcedure, not in auth session.
 */
export interface SessionWorkspace {
	id: string;
	name: string;
	handle: string;
	plan: PlanType;
	type: 'personal' | 'creator' | 'solo_artist' | 'band' | 'product';
	timezone: WorkspaceTimezone;
	spotifyArtistId: string | null;
	stripeCustomerId: string | null;
	stripeCustomerId_devMode: string | null;
	stripeConnectAccountId: string | null;
	stripeConnectAccountId_devMode: string | null;
	stripeConnectChargesEnabled: boolean;
	stripeConnectChargesEnabled_devMode: boolean;
	currency: 'usd' | 'gbp';
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
	shippingAddressCity: string | null;
	shippingAddressState: string | null;
	shippingAddressPostalCode: string | null;
	shippingAddressCountry: string | null;
	shippingAddressPhone: string | null;
	brandKit: BrandKit | null;
	avatarImageS3Key: string | undefined;
	headerImageS3Key: string | undefined;
	role: 'owner' | 'admin' | 'member';
	// Internal fields from Drizzle relations - kept for type compatibility
	// These are populated by fetchUserWorkspaces but not typically used directly
	_avatarImages: { file: { s3Key: string | null } }[];
	_headerImages: { file: { s3Key: string | null } }[];
}

export type SessionWorkspaces = SessionWorkspace[];
