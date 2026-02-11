import type { PlanType } from '@barely/const';
import type { InsertTransactionLineItem, Transaction } from '@barely/validators/schemas';
import type Stripe from 'stripe';
import { NextResponse } from 'next/server';
import {
	getCurrentAppVariant,
	WORKSPACE_PLAN_TYPES,
	WORKSPACE_PLANS,
} from '@barely/const';
import { dbHttp } from '@barely/db/client';
import {
	Campaigns,
	TransactionLineItems,
	Transactions,
	Workspaces,
} from '@barely/db/sql';
import { getAbsoluteUrl, newId, raise } from '@barely/utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { StripeTransactionMetadata } from '../integrations/stripe/stripe.schema';
import { libEnv } from '../../env';
import { pushEvent } from '../integrations/pusher/pusher-server';
import { isStripeTestEnvironment, stripe } from '../integrations/stripe';
import {
	stripeLineItemMetadataSchema,
	stripeTransactionMetadataSchema,
} from '../integrations/stripe/stripe.schema';
import { log } from '../utils/log';
import { assignPlaylistPitchToReviewers } from './playlist-pitch-review.fns';
import { totalPlaylistReachByGenres } from './playlist.fns';

export async function createStripeWorkspaceCustomer(props: {
	workspaceId: string;
	email: string;
	name: string;
	phone?: string;
}) {
	const stripeCustomer = await stripe.customers.create({
		email: props.email,
		phone: props.phone,
		name: props.name,
		metadata: {
			workspaceId: props.workspaceId,
		},
	});

	// update workspace
	const stripeWorkspace = await dbHttp
		.update(Workspaces)
		.set(
			(
				libEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
					libEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview'
			) ?
				{
					stripeCustomerId_devMode: stripeCustomer.id,
				}
			:	{
					stripeCustomerId: stripeCustomer.id,
				},
		)
		.where(eq(Workspaces.id, props.workspaceId))
		.returning();

	return stripeWorkspace[0] ?? raise('Failed to create Stripe customer.');
}

export function getPlanByStripePriceId(priceId: string) {
	for (const [, plan] of WORKSPACE_PLANS) {
		if (
			plan.price.monthly.priceIds.test === priceId ||
			plan.price.monthly.priceIds.production === priceId ||
			plan.price.yearly.priceIds.test === priceId ||
			plan.price.yearly.priceIds.production === priceId
		) {
			return plan;
		}
	}
	return undefined;
}

export async function handleStripePlanCheckoutSessionComplete(
	session: Stripe.Checkout.Session,
) {
	const transactionMetadata = stripeTransactionMetadataSchema.parse(session.metadata);
	const transactionId = newId('transaction');

	const transaction: Transaction = {
		id: transactionId,
		workspaceId: transactionMetadata.workspaceId,
		completedAt: new Date().toISOString(),
		amount: session.amount_total ?? 0,
		status: 'succeeded',
		stripeId: session.id,
		stripeMetadata: transactionMetadata,
		createdById: transactionMetadata.createdById,
	};

	const lineItems: InsertTransactionLineItem[] = [];
	const campaignIds: string[] = [];

	console.log('session.line_items => ', session.line_items);

	console.log(
		'session.line_items.price => ',
		session.line_items?.data.map(li => li.price),
	);

	if (session.line_items) {
		await Promise.allSettled(
			session.line_items.data.map(async (line_item, idx) => {
				// console.log(`product ${idx} => `, line_item.price?.product);
				const product = line_item.price?.product as Stripe.Product;
				const lineItemMetadata = stripeLineItemMetadataSchema.parse(product.metadata);

				console.log(`lineItemMetadata ${idx}`, lineItemMetadata);

				/**
				 * WORKSPACE PLAN
				 * */
				const plan =
					line_item.price?.id ? getPlanByStripePriceId(line_item.price.id) : undefined;

				if (plan) {
					//
					/** when the workspace subscribes to a plan, update the workspace:
					 * plan,
					 * linkUsageLimit,
					 * billingCycleStart,
					 */

					const workspace = await dbHttp.query.Workspaces.findFirst({
						where: eq(Workspaces.id, transactionMetadata.workspaceId),
					});

					if (!workspace) {
						await log({
							type: 'errors',
							location: 'handleStripeCheckoutSessionComplete',
							message: `Workspace with Stripe ID ${transactionMetadata.workspaceId} not found.`,
						});

						return NextResponse.json({ received: true }, { status: 200 });
					}

					await dbHttp
						.update(Workspaces)
						.set({
							plan: plan.id,
							billingCycleStart: new Date().getDate(),
						})
						.where(eq(Workspaces.id, workspace.id));

					await pushEvent('workspace', 'update', {
						id: workspace.id,
					});

					const item: InsertTransactionLineItem = {
						id: newId('lineItem'),
						transactionId: transactionId,
						totalDue: line_item.amount_total,
						paymentType: 'subscription',
						name: plan.name,
						description: plan.name,
					};

					return lineItems.push(item);
				}

				/** CAMPAIGNS */
				const campaign =
					lineItemMetadata.campaignId ?
						await dbHttp.query.Campaigns.findFirst({
							where: eq(Campaigns.id, lineItemMetadata.campaignId),
							with: {
								track: {
									with: {
										_genres: true,
									},
								},
							},
						})
					:	undefined;

				let name = '';
				let description = '';

				if (campaign) {
					campaignIds.push(campaign.id);

					switch (campaign.type) {
						case 'playlistPitch': {
							if (!campaign.curatorReach) {
								throw new Error('Campaign must have a defined curator reach.');
							}

							console.log('assigning playlist pitch to reviewers');
							await assignPlaylistPitchToReviewers(campaign.id);

							const { totalPlaylists, totalCurators } = await totalPlaylistReachByGenres(
								campaign.track._genres.map(_g => _g.genreId),
							);

							const estimatedPlaylists = Math.ceil(
								(campaign.curatorReach * totalPlaylists) / totalCurators,
							);

							name = `playlist.pitch :: ${campaign.track.name}`;
							description = `👥 ${campaign.curatorReach} curators · 🎧 ${estimatedPlaylists} playlists `;

							break;
						}

						default: {
							throw new Error('Unknown campaign type');
						}
					}
					const item: InsertTransactionLineItem = {
						id: newId('lineItem'),
						transactionId: transactionId,
						totalDue: line_item.amount_total,
						paymentType: 'oneTime',
						name,
						description,
					};

					return lineItems.push(item);
				}
			}),
		);
	}

	// await db.pool.transaction(async tx => {
	// 	console.log('adding transaction to db => ', transaction);

	// 	await tx.insert(Transactions).values(transaction);

	// 	console.log('adding line items to db => ', lineItems);

	// 	await tx.insert(TransactionLineItems).values(lineItems);

	// 	await Promise.allSettled(
	// 		campaignIds.map(async campaignId => {
	// 			await tx
	// 				.update(Campaigns)
	// 				.set({
	// 					stage: 'active',
	// 				})
	// 				.where(eq(Campaigns.id, campaignId));
	// 		}),
	// 	);
	// });

	await dbHttp.insert(Transactions).values(transaction);

	await dbHttp.insert(TransactionLineItems).values(lineItems);

	await Promise.allSettled(
		campaignIds.map(async campaignId => {
			await dbHttp
				.update(Campaigns)
				.set({
					stage: 'active',
				})
				.where(eq(Campaigns.id, campaignId));
		}),
	);
}

export async function handleStripeSubscriptionUpdated(subscription: Stripe.Subscription) {
	const priceId = subscription.items.data[0]?.price.id;
	const newPlan = priceId ? getPlanByStripePriceId(priceId) : undefined;

	console.log('newPlan => ', newPlan);

	if (!newPlan) {
		console.log('Invalid plan in customer.subscription.updated event');
		return;
	}

	const stripeCustomerId = subscription.customer as string;

	const workspace = await dbHttp.query.Workspaces.findFirst({
		where: eq(
			isStripeTestEnvironment() ?
				Workspaces.stripeCustomerId_devMode
			:	Workspaces.stripeCustomerId,
			stripeCustomerId,
		),
	});

	if (!workspace) {
		console.log('Workspace not found');
		return;
	}

	console.log('raw plan name');

	const newPlanId = z.enum(WORKSPACE_PLAN_TYPES).parse(newPlan.id);

	// handle disabling anything if the plan has been downgraded. nothing for now.

	// update plan in the db
	if (workspace.plan !== newPlanId) {
		await dbHttp
			.update(Workspaces)
			.set({
				plan: newPlanId,
			})
			.where(eq(Workspaces.id, workspace.id));

		await pushEvent('workspace', 'update', {
			id: workspace.id,
		});
	}
}

export async function createUpgradeUrl(props: {
	workspace: {
		id: string;
		handle: string;
		stripeCustomerId?: string | null;
		stripeCustomerId_devMode?: string | null;
	};
	user: {
		id: string;
		email: string;
		fullName?: string | null;
		firstName?: string | null;
		lastName?: string | null;
	};
	planId: PlanType;
	billingCycle: 'monthly' | 'yearly';
}): Promise<string> {
	const { workspace, user, planId, billingCycle } = props;

	// Determine if we're in test environment
	// const testEnvironment = isDevelopment() || isPreview() || isStripeTestEnvironment

	// Get the appropriate Stripe customer ID
	const stripeCustomerId =
		isStripeTestEnvironment() ?
			workspace.stripeCustomerId_devMode
		:	workspace.stripeCustomerId;

	// Get the plan details
	const plan = WORKSPACE_PLANS.get(planId);
	if (!plan) {
		throw new Error('Invalid plan ID');
	}

	// Get the appropriate price ID
	const priceId =
		plan.price[billingCycle].priceIds[isStripeTestEnvironment() ? 'test' : 'production'];
	if (!priceId) {
		throw new Error('Invalid price ID');
	}

	// Check if workspace has an active subscription
	if (stripeCustomerId) {
		const activeSubscription = await stripe.subscriptions
			.list({
				customer: stripeCustomerId,
				status: 'active',
				limit: 1,
			})
			.then(res => res.data[0]);

		console.log('activeSubscription => ', activeSubscription);

		// If there's an active subscription, create billing portal session
		if (activeSubscription) {
			const portalSession = await stripe.billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: getAbsoluteUrl(
					getCurrentAppVariant(),
					`${workspace.handle}/settings/billing?upgraded=true`,
				),
				flow_data: {
					type: 'subscription_update_confirm',
					subscription_update_confirm: {
						subscription: activeSubscription.id,
						items: [
							{
								id: activeSubscription.items.data[0]?.id ?? raise('no items'),
								quantity: 1,
								price: priceId,
							},
						],
					},
					after_completion: {
						type: 'redirect',
						redirect: {
							return_url: getAbsoluteUrl(
								getCurrentAppVariant(),
								`${workspace.handle}/settings/billing?upgraded=true`,
							),
						},
					},
				},
			});

			return portalSession.url;
		}
	}

	// Create or retrieve Stripe customer
	const workspaceWithCustomer =
		stripeCustomerId ? workspace : (
			await createStripeWorkspaceCustomer({
				workspaceId: workspace.id,
				email: user.email,
				name: user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(' '),
			})
		);

	const finalStripeCustomerId =
		isStripeTestEnvironment() ?
			workspaceWithCustomer.stripeCustomerId_devMode
		:	workspaceWithCustomer.stripeCustomerId;

	if (!finalStripeCustomerId) {
		throw new Error('Failed to create or retrieve Stripe customer');
	}

	// Prepare metadata
	const metadata: StripeTransactionMetadata = {
		createdById: user.id,
		workspaceId: workspace.id,
	};

	// Create checkout session
	const session = await stripe.checkout.sessions.create({
		customer: finalStripeCustomerId,
		mode: 'subscription',
		success_url: getAbsoluteUrl(
			getCurrentAppVariant(),
			`${workspace.handle}/settings/billing?upgraded=true`,
		),
		cancel_url: getAbsoluteUrl(
			getCurrentAppVariant(),
			`${workspace.handle}/settings/billing/upgrade`,
		),
		payment_method_types: ['card'],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		client_reference_id: workspace.id,
		metadata,
		// Additional options from Dub.co
		allow_promotion_codes: true,
		automatic_tax: {
			enabled: true,
		},
		tax_id_collection: {
			enabled: true,
		},
		customer_update: {
			name: 'auto',
			address: 'auto',
		},
		billing_address_collection: 'required',
	});

	if (!session.url) {
		throw new Error('Failed to create checkout session');
	}

	return session.url;
}
