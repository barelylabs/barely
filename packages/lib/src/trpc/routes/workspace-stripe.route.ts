import type { TRPCRouterRecord } from '@trpc/server';
import { WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { Workspaces } from '@barely/db/sql';
import { getAbsoluteUrl, getFullNameFromFirstAndLast } from '@barely/utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { StripeTransactionMetadata } from '../../integrations/stripe/stripe.schema';
import { libEnv } from '../../../env';
import { createStripeWorkspaceCustomer } from '../../functions/workspace-stripe.fns';
import { stripe } from '../../integrations/stripe';
import { workspaceProcedure } from '../trpc';

export const workspaceStripeRoute = {
	createCheckoutLink: workspaceProcedure
		.input(
			z.object({
				planId: z.enum([
					'free',
					'bedroom',
					'rising',
					'breakout',
					'bedroom.plus',
					'rising.plus',
					'breakout.plus',
					'agency',
				]),
				billingCycle: z.enum(['monthly', 'yearly']),
				successPath: z.string().optional(),
				cancelPath: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const prevWorkspace = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.id, ctx.workspace.id),
				columns: {
					stripeCustomerId_devMode: true,
					stripeCustomerId: true,
				},
			});

			if (!prevWorkspace) {
				throw new Error('Workspace not found.');
			}

			const testEnvironment =
				libEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
				libEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview';
			const priceId = WORKSPACE_PLANS.get(input.planId)?.price[input.billingCycle]
				.priceIds[testEnvironment ? 'test' : 'production'];

			if (!priceId) {
				throw new Error('Invalid priceId.');
			}

			const workspaceHasStripeCustomerId =
				testEnvironment ?
					!!prevWorkspace.stripeCustomerId_devMode
				:	!!prevWorkspace.stripeCustomerId;

			const workspace =
				workspaceHasStripeCustomerId ?
					{ ...ctx.workspace, ...prevWorkspace }
				:	await createStripeWorkspaceCustomer({
						workspaceId: ctx.workspace.id,
						email: ctx.user.email,
						name:
							ctx.user.fullName ??
							getFullNameFromFirstAndLast(ctx.user.firstName, ctx.user.lastName),
						// phone: ctx.user.phone ?? undefined,
					});

			if (
				(testEnvironment && !workspace.stripeCustomerId_devMode) ||
				(!testEnvironment && !workspace.stripeCustomerId)
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
} satisfies TRPCRouterRecord;
