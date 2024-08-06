import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { env } from '../../../env';
import { sqlAnd } from '../../../utils/sql';
import { getAbsoluteUrl } from '../../../utils/url';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { insertProviderAccountSchema } from './provider-account.schema';
import { ProviderAccounts } from './provider-account.sql';

const providerAccountRouter = createTRPCRouter({
	delete: privateProcedure
		.input(
			z.object({
				provider: insertProviderAccountSchema.shape.provider,
				providerAccountId: insertProviderAccountSchema.shape.providerAccountId,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.http
				.delete(ProviderAccounts)
				.where(
					and(
						eq(ProviderAccounts.provider, input.provider),
						eq(ProviderAccounts.providerAccountId, input.providerAccountId),
					),
				);

			return;
		}),

	byCurrentUser: privateProcedure
		.input(
			z
				.object({
					providers: insertProviderAccountSchema.shape.provider.array().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const accounts = await ctx.db.http.query.ProviderAccounts.findMany({
				where: and(
					eq(ProviderAccounts.userId, ctx.user.id),
					// todo - check if this is working for filtering providerAccounts by provider(s)
					input?.providers ?
						inArray(ProviderAccounts.provider, input.providers)
					:	undefined,
				),
			});
			return accounts;
		}),

	byWorkspace: workspaceQueryProcedure
		.input(
			z.object({
				handle: z.string(),
				providers: insertProviderAccountSchema.shape.provider.array().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const accounts = await ctx.db.http.query.ProviderAccounts.findMany({
				where: sqlAnd([
					eq(ProviderAccounts.workspaceId, ctx.workspace.id),
					input.providers ?
						inArray(ProviderAccounts.provider, input.providers)
					:	undefined,
				]),
			});

			return accounts;
		}),

	authorize: privateProcedure
		.input(
			z.object({
				provider: insertProviderAccountSchema.shape.provider,
			}),
		)
		.mutation(({ ctx, input }) => {
			const { provider } = input;

			const state = {
				workspaceId: ctx.workspace.id,
				redirectUrl: getAbsoluteUrl('app', `${ctx.workspace.handle}/settings/apps`),
			};

			const base64EncodedState = Buffer.from(JSON.stringify(state)).toString('base64');

			if (provider === 'mailchimp') {
				const mailchimpAuthorization = new URL(
					'https://login.mailchimp.com/oauth2/authorize',
				);
				mailchimpAuthorization.searchParams.set('response_type', 'code');
				mailchimpAuthorization.searchParams.set('client_id', env.MAILCHIMP_CLIENT_ID);
				mailchimpAuthorization.searchParams.set(
					'redirect_uri',
					getAbsoluteUrl('app', `api/apps/callback/mailchimp`),
				);
				mailchimpAuthorization.searchParams.set('state', base64EncodedState);
				return mailchimpAuthorization.toString();
			}

			if (provider === 'spotify') {
				const spotifyAuthorization = new URL('https://accounts.spotify.com/authorize');
				spotifyAuthorization.searchParams.set('client_id', env.SPOTIFY_CLIENT_ID);
				spotifyAuthorization.searchParams.set('response_type', 'code');
				const redirectUri = getAbsoluteUrl('app', `api/apps/callback/spotify`);
				console.log('redirectUri', redirectUri);
				spotifyAuthorization.searchParams.set(
					'redirect_uri',
					getAbsoluteUrl('app', `api/apps/callback/spotify`),
				);
				spotifyAuthorization.searchParams.set('state', base64EncodedState);
				spotifyAuthorization.searchParams.set(
					'scope',
					'ugc-image-upload,user-modify-playback-state,user-read-playback-state,user-modify-playback-state,user-read-currently-playing,user-follow-modify,user-follow-read,user-read-recently-played,user-read-playback-position,user-top-read,playlist-read-collaborative,playlist-modify-public,playlist-read-private,playlist-modify-private,app-remote-control,streaming,user-read-email,user-read-private,user-library-modify,user-library-read',
				);
				spotifyAuthorization.searchParams.set('show_dialog', 'true');
				const authUrl = spotifyAuthorization.toString();
				console.log('authUrl', authUrl);
				return authUrl;
			}

			return null;
		}),
});

export { providerAccountRouter };
