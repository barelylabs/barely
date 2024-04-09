import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { getAbsoluteUrl } from '../../../utils/url';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { isStripeTestEnvironment, stripe } from '../../stripe';
import { Workspaces } from '../workspace/workspace.sql';

export const stripeConnectRouter = createTRPCRouter({
	getOnboardingLink: privateProcedure
		.input(
			z.object({
				callbackPath: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let stripeConnectAccountId =
				isStripeTestEnvironment() ?
					ctx.workspace.stripeConnectAccountId_devMode
				:	ctx.workspace.stripeConnectAccountId;
			console.log('stripeConnectAccountId', stripeConnectAccountId);

			const chargesEnabled =
				isStripeTestEnvironment() ?
					ctx.workspace.stripeConnectChargesEnabled_devMode
				:	ctx.workspace.stripeConnectChargesEnabled;

			if (stripeConnectAccountId && chargesEnabled) {
				return null;
			}

			if (stripeConnectAccountId && !chargesEnabled) {
				const stripeAccount = await stripe.accounts.retrieve(stripeConnectAccountId);

				console.log('stripeAccount', stripeAccount);

				if (stripeAccount.charges_enabled) {
					await ctx.db.http
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
						url: ctx.workspace.website ?? undefined,
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

				await ctx.db.http
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
});
