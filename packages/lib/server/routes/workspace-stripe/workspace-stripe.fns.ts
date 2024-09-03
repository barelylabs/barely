import type Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import type { InsertTransactionLineItem } from '../transaction/transaction-line-item.schema';
import type { Transaction } from '../transaction/transaction.schema';
import { env } from '../../../env';
import { newId } from '../../../utils/id';
import { log } from '../../../utils/log';
import { pushEvent } from '../../../utils/pusher-server';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import { stripe } from '../../stripe';
import {
	stripeLineItemMetadataSchema,
	stripeTransactionMetadataSchema,
} from '../../stripe/stripe.schema';
import { Campaigns } from '../campaign/campaign.sql';
import { assignPlaylistPitchToReviewers } from '../playlist-pitch-review/playlist-pitch-review.fns';
import { totalPlaylistReachByGenres } from '../playlist/playlist.fns';
import { TransactionLineItems } from '../transaction/transaction-line-item.sql';
import { Transactions } from '../transaction/transaction.sql';
import { WORKSPACE_PLANS } from '../workspace/workspace.settings';
import { Workspaces } from '../workspace/workspace.sql';

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
			env.VERCEL_ENV === 'development' || env.VERCEL_ENV === 'preview' ?
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

export async function handleStripeCheckoutSessionComplete(
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
							type: 'stripe',
							fn: 'handleStripeCheckoutSessionComplete',
							message: `Workspace with Stripe ID ${transactionMetadata.workspaceId} not found.`,
						});

						return NextResponse.json({ received: true }, { status: 200 });
					}

					await dbHttp
						.update(Workspaces)
						.set({
							plan: plan.id,
							// linkUsageLimit: plan.link.usageLimit,
							billingCycleStart: new Date().getDate(),
						})
						.where(eq(Workspaces.id, workspace.id));

					await pushEvent('workspace', 'update', {
						id: workspace.id,
					});

					const item: InsertTransactionLineItem = {
						id: newId('lineItem'),
						transactionId: transactionId,
						totalDue: line_item.amount_total ?? 0,
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

							name = `playlist.pitch :: ${campaign.track.name ?? ''}`;
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
						totalDue: line_item.amount_total ?? 0,
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
