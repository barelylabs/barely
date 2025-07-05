import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { getAbsoluteUrl } from '@barely/utils';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { isStripeTestEnvironment, stripe } from '../../integrations/stripe';
import { workspaceProcedure } from '../trpc';

export const stripeConnectRoute = {
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

				// if (stripeAccount.)
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
					'app',
					input.callbackPath + '?refreshOnboarding=true',
				),
				return_url: getAbsoluteUrl('app', input.callbackPath),
				type: 'account_onboarding',
			});

			console.log('accountLink', accountLink);

			return accountLink.url;
		}),
} satisfies TRPCRouterRecord;
