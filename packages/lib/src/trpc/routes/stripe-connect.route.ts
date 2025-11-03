import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { getAbsoluteUrl, getCurrentAppVariant } from '@barely/utils';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { isStripeTestEnvironment, stripe } from '../../integrations/stripe';
import { workspaceProcedure } from '../trpc';

export const stripeConnectRoute = {
	createAccountSession: workspaceProcedure.mutation(async ({ ctx }) => {
		const workspace = await dbHttp.query.Workspaces.findFirst({
			where: eq(Workspaces.id, ctx.workspace.id),
			columns: {
				stripeConnectAccountId_devMode: true,
				stripeConnectAccountId: true,
				stripeConnectChargesEnabled_devMode: true,
				stripeConnectChargesEnabled: true,
				website: true,
			},
		});

		if (!workspace) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' });
		}

		let stripeConnectAccountId =
			isStripeTestEnvironment() ?
				workspace.stripeConnectAccountId_devMode
			:	workspace.stripeConnectAccountId;

		const chargesEnabled =
			isStripeTestEnvironment() ?
				workspace.stripeConnectChargesEnabled_devMode
			:	workspace.stripeConnectChargesEnabled;

		// If charges are already enabled, return null (no onboarding needed)
		if (stripeConnectAccountId && chargesEnabled) {
			return null;
		}

		// Check if account exists and update charges status if needed
		if (stripeConnectAccountId && !chargesEnabled) {
			const stripeAccount = await stripe.accounts.retrieve(stripeConnectAccountId);

			if (stripeAccount.charges_enabled) {
				await dbHttp
					.update(Workspaces)
					.set(
						isStripeTestEnvironment() ?
							{ stripeConnectChargesEnabled_devMode: true }
						:	{ stripeConnectChargesEnabled: true },
					)
					.where(eq(Workspaces.id, ctx.workspace.id));
				return null;
			}
		}

		// Create account if it doesn't exist
		if (!stripeConnectAccountId) {
			const account = await stripe.accounts.create({
				type: 'standard',
				email: ctx.user.email,
				business_profile: {
					mcc: '5699', // 5699 corresponds to Miscellaneous Apparel and Accessory Shops
					name: ctx.workspace.name,
					url: workspace.website ?? undefined,
					product_description:
						ctx.workspace.type === 'solo_artist' || ctx.workspace.type === 'band' ?
							'We sell band merchandise such as T-shirts, CDs, and other music-related items'
						:	undefined,
				},
				metadata: {
					workspaceId: ctx.workspace.id,
					createdByUserId: ctx.user.id,
				},
			});
			stripeConnectAccountId = account.id;

			await dbHttp
				.update(Workspaces)
				.set(
					isStripeTestEnvironment() ?
						{ stripeConnectAccountId_devMode: stripeConnectAccountId }
					:	{ stripeConnectAccountId },
				)
				.where(eq(Workspaces.id, ctx.workspace.id));
		}

		// Create account session for embedded onboarding
		const accountSession = await stripe.accountSessions.create({
			account: stripeConnectAccountId,
			components: {
				account_onboarding: {
					enabled: true,
					features: {
						// external_account_collection: true,
						// disable_stripe_user_authentication: true,
					},
				},
			},
		});

		return {
			account_id: stripeConnectAccountId,
			client_secret: accountSession.client_secret,
		};
	}),

	getOnboardingLink: workspaceProcedure
		.input(
			z.object({
				callbackPath: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const workspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, ctx.workspace.id),
				columns: {
					stripeConnectAccountId_devMode: true,
					stripeConnectAccountId: true,
					stripeConnectChargesEnabled_devMode: true,
					stripeConnectChargesEnabled: true,
					website: true,
				},
			});

			if (!workspace) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' });
			}

			let stripeConnectAccountId =
				isStripeTestEnvironment() ?
					workspace.stripeConnectAccountId_devMode
				:	workspace.stripeConnectAccountId;
			console.log('stripeConnectAccountId', stripeConnectAccountId);

			const chargesEnabled =
				isStripeTestEnvironment() ?
					workspace.stripeConnectChargesEnabled_devMode
				:	workspace.stripeConnectChargesEnabled;

			if (stripeConnectAccountId && chargesEnabled) {
				return null;
			}

			if (stripeConnectAccountId && !chargesEnabled) {
				const stripeAccount = await stripe.accounts.retrieve(stripeConnectAccountId);

				console.log('stripeAccount', stripeAccount);

				if (stripeAccount.charges_enabled) {
					await dbHttp
						.update(Workspaces)
						.set(
							isStripeTestEnvironment() ?
								{ stripeConnectChargesEnabled_devMode: true }
							:	{
									stripeConnectChargesEnabled: true,
								},
						)
						.where(eq(Workspaces.id, ctx.workspace.id));
					return null;
				}
			}

			if (!stripeConnectAccountId) {
				const account = await stripe.accounts.create({
					type: 'standard',
					email: ctx.user.email,
					business_profile: {
						mcc: '5699', // 5699 corresponds to Miscellaneous Apparel and Accessory Shops 🤷
						name: ctx.workspace.name,
						url: workspace.website ?? undefined,
						product_description:
							ctx.workspace.type === 'solo_artist' || ctx.workspace.type === 'band' ?
								'We sell band merchandise such as T-shirts, CDs, and other music-related items'
							:	undefined,
					},
					metadata: {
						workspaceId: ctx.workspace.id,
						createdByUserId: ctx.user.id,
					},
				});
				stripeConnectAccountId = account.id;

				await dbHttp
					.update(Workspaces)
					.set(
						isStripeTestEnvironment() ?
							{ stripeConnectAccountId_devMode: stripeConnectAccountId }
						:	{ stripeConnectAccountId },
					)
					.where(eq(Workspaces.id, ctx.workspace.id));
			}

			const accountLink = await stripe.accountLinks.create({
				account: stripeConnectAccountId,
				refresh_url: getAbsoluteUrl(
					getCurrentAppVariant(),
					input.callbackPath + '?refreshOnboarding=true',
				),
				return_url: getAbsoluteUrl(getCurrentAppVariant(), input.callbackPath),
				type: 'account_onboarding',
			});

			console.log('accountLink', accountLink);

			return accountLink.url;
		}),
} satisfies TRPCRouterRecord;
