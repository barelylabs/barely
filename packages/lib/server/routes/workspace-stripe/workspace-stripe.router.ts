import { z } from 'zod';

import type { StripeTransactionMetadata } from '../../stripe/stripe.schema';
import { env } from '../../../env';
import { fullNameToFirstAndLast } from '../../../utils/name';
import { getAbsoluteUrl } from '../../../utils/url';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { stripe } from '../../stripe';
import { WORKSPACE_PLANS } from '../workspace/workspace.settings';
import { createStripeWorkspaceCustomer } from './workspace-stripe.fns';

export const workspaceStripeRouter = createTRPCRouter({
	createCheckoutLink: privateProcedure
		.input(
			z.object({
				planId: z.enum(['pro']),
				billingCycle: z.enum(['monthly', 'yearly']),
				successPath: z.string().optional(),
				cancelPath: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const testEnvironment =
				env.VERCEL_ENV === 'development' || env.VERCEL_ENV === 'preview';
			const priceId = WORKSPACE_PLANS.get(input.planId)?.price[input.billingCycle]
				.priceIds[testEnvironment ? 'test' : 'production'];

			if (!priceId) {
				throw new Error('Invalid priceId.');
			}

			const workspaceHasStripeCustomerId = testEnvironment
				? !!ctx.workspace.stripeCustomerId_devMode
				: !!ctx.workspace.stripeCustomerId;

			const workspace = workspaceHasStripeCustomerId
				? ctx.workspace
				: await createStripeWorkspaceCustomer({
						workspaceId: ctx.workspace.id,
						email: ctx.user.email,
						name:
							ctx.user.fullName ??
							fullNameToFirstAndLast(ctx.user.firstName, ctx.user.lastName),
						phone: ctx.user.phone ?? undefined,
					});

			if (
				(testEnvironment && !workspace?.stripeCustomerId_devMode) ||
				(!testEnvironment && !workspace?.stripeCustomerId)
			) {
				throw new Error('workspace must have a stripeCustomerId.');
			}

			const successUrl = getAbsoluteUrl(
				'app',
				input.successPath ?? `${ctx.workspace.handle}/settings/billing?success=true`,
			);
			const cancelUrl = getAbsoluteUrl(
				'app',
				input.cancelPath ?? `${ctx.workspace.handle}/settings/billing`,
			);

			const metadata: StripeTransactionMetadata = {
				createdById: ctx.user.id,
				workspaceId: ctx.workspace.id,
			};

			const session = await stripe.checkout.sessions.create({
				customer: workspace.stripeCustomerId ?? undefined,
				mode: 'subscription',
				success_url: successUrl,
				cancel_url: cancelUrl,
				payment_method_types: ['card'],
				line_items: [
					{
						price: priceId,
						quantity: 1,
					},
				],
				client_reference_id: ctx.workspace.id,
				metadata,
			});

			return session.url;
		}),
});
