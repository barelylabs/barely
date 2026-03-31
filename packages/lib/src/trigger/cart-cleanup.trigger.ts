import { dbPool, makePool } from '@barely/db/pool';
import { CartFulfillmentProducts, CartFulfillments, Carts } from '@barely/db/sql';
import { Flow_Runs } from '@barely/db/sql/flow.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { isProduction } from '@barely/utils';
import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, inArray, isNull, lt } from 'drizzle-orm';

import { stripe } from '../integrations/stripe';
import { log } from '../utils/log';

const BATCH_SIZE = 100;

interface CleanupResult {
	deleted: number;
	stripeCanceled: number;
	stripeErrors: number;
}

interface CleanupOptions {
	stages?: (typeof Carts.$inferSelect)['stage'][];
	requireNoEmail?: boolean;
	olderThan: Date;
}

async function cancelStripePaymentIntent(
	paymentIntentId: string | null,
	stripeAccountId: string | null,
): Promise<boolean> {
	if (!paymentIntentId || !stripeAccountId) return false;

	try {
		await stripe.paymentIntents.cancel(paymentIntentId, {
			stripeAccount: stripeAccountId,
		});
		return true;
	} catch {
		// PI may already be canceled, captured, or expired
		return false;
	}
}

async function cleanupCartsByCriteria(
	db: ReturnType<typeof dbPool>,
	options: CleanupOptions,
): Promise<CleanupResult> {
	let totalDeleted = 0;
	let totalStripeCanceled = 0;
	let totalStripeErrors = 0;

	while (true) {
		// Build WHERE conditions — always guard against deleting converted carts
		const conditions = [
			isNull(Carts.checkoutConvertedAt),
			lt(Carts.createdAt, options.olderThan),
		];

		if (options.stages) {
			conditions.push(inArray(Carts.stage, options.stages));
		}

		if (options.requireNoEmail) {
			conditions.push(isNull(Carts.email));
		}

		// Query batch with workspace Stripe account info
		const carts = await db
			.select({
				id: Carts.id,
				checkoutStripePaymentIntentId: Carts.checkoutStripePaymentIntentId,
				upsellStripePaymentIntentId: Carts.upsellStripePaymentIntentId,
				stripeConnectAccountId: Workspaces.stripeConnectAccountId,
				stripeConnectAccountId_devMode: Workspaces.stripeConnectAccountId_devMode,
			})
			.from(Carts)
			.innerJoin(Workspaces, eq(Carts.workspaceId, Workspaces.id))
			.where(and(...conditions))
			.limit(BATCH_SIZE);

		if (carts.length === 0) break;

		const cartIds = carts.map(c => c.id);

		// Step 1: Cancel Stripe PaymentIntents (best-effort)
		for (const cart of carts) {
			const stripeAccount =
				isProduction() ?
					cart.stripeConnectAccountId
				:	cart.stripeConnectAccountId_devMode;

			const checkoutCanceled = await cancelStripePaymentIntent(
				cart.checkoutStripePaymentIntentId,
				stripeAccount,
			);

			const upsellCanceled = await cancelStripePaymentIntent(
				cart.upsellStripePaymentIntentId,
				stripeAccount,
			);

			if (checkoutCanceled || upsellCanceled) {
				totalStripeCanceled++;
			} else if (stripeAccount && cart.checkoutStripePaymentIntentId) {
				totalStripeErrors++;
			}
		}

		// Step 2: Delete CartFulfillmentProducts for fulfillments belonging to these carts
		const fulfillments = await db
			.select({ id: CartFulfillments.id })
			.from(CartFulfillments)
			.where(inArray(CartFulfillments.cartId, cartIds));

		if (fulfillments.length > 0) {
			const fulfillmentIds = fulfillments.map(f => f.id);
			await db
				.delete(CartFulfillmentProducts)
				.where(inArray(CartFulfillmentProducts.cartFulfillmentId, fulfillmentIds));
			await db.delete(CartFulfillments).where(inArray(CartFulfillments.cartId, cartIds));
		}

		// Step 3: Null out Flow_Runs.triggerCartId references
		await db
			.update(Flow_Runs)
			.set({ triggerCartId: null })
			.where(inArray(Flow_Runs.triggerCartId, cartIds));

		// Step 4: Delete carts
		await db.delete(Carts).where(inArray(Carts.id, cartIds));

		totalDeleted += carts.length;
	}

	return {
		deleted: totalDeleted,
		stripeCanceled: totalStripeCanceled,
		stripeErrors: totalStripeErrors,
	};
}

/**
 * Daily cleanup of abandoned and empty carts.
 *
 * Phase 1: Ghost carts — checkoutCreated with no email, older than 48 hours.
 *          These are bots, casual visitors, or accidental page loads.
 *
 * Phase 2: Abandoned checkouts — checkoutAbandoned or checkoutCreated with no
 *          conversion, older than 90 days.
 *
 * Phase 3: All non-converting carts — any stage with no checkoutConvertedAt,
 *          older than 90 days. Catches remaining stages like upsellAbandoned.
 *
 * Safety: Every query includes `checkoutConvertedAt IS NULL` so converted carts
 * (real orders) are never touched.
 */
export const dailyCartCleanup = schedules.task({
	id: 'daily-cart-cleanup',
	cron: { pattern: '0 3 * * *', timezone: 'UTC' },
	run: async () => {
		const pool = makePool();
		const startTime = Date.now();

		try {
			const db = dbPool(pool);

			const now = new Date();

			// Phase 1: Ghost carts (no email, checkoutCreated, > 48 hours)
			const ghostCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
			const ghostResult = await cleanupCartsByCriteria(db, {
				stages: ['checkoutCreated'],
				requireNoEmail: true,
				olderThan: ghostCutoff,
			});

			// Phase 2: Abandoned checkouts (no conversion, > 90 days)
			const abandonedCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			const abandonedResult = await cleanupCartsByCriteria(db, {
				stages: ['checkoutAbandoned', 'checkoutCreated'],
				olderThan: abandonedCutoff,
			});

			// Phase 3: All non-converting carts (any stage, > 90 days)
			const nonConvertingResult = await cleanupCartsByCriteria(db, {
				olderThan: abandonedCutoff,
			});

			const duration = Date.now() - startTime;
			const totalStripeErrors =
				ghostResult.stripeErrors +
				abandonedResult.stripeErrors +
				nonConvertingResult.stripeErrors;

			await log({
				message:
					`Cart cleanup completed:\n` +
					`- Ghost carts (>48h, no email): ${ghostResult.deleted} deleted, ${ghostResult.stripeCanceled} PIs canceled\n` +
					`- Abandoned checkouts (>90d): ${abandonedResult.deleted} deleted, ${abandonedResult.stripeCanceled} PIs canceled\n` +
					`- Non-converting (>90d): ${nonConvertingResult.deleted} deleted, ${nonConvertingResult.stripeCanceled} PIs canceled\n` +
					`- Stripe errors: ${totalStripeErrors}\n` +
					`- Duration: ${duration}ms`,
				type: totalStripeErrors > 10 ? 'errors' : 'logs',
				location: 'dailyCartCleanup.summary',
				mention: totalStripeErrors > 10,
			});
		} catch (error) {
			await log({
				message: `Fatal error in cart cleanup: ${String(error)}`,
				type: 'errors',
				location: 'dailyCartCleanup.fatal',
				mention: true,
			});
			throw error;
		} finally {
			try {
				await pool.end();
			} catch (cleanupError) {
				await log({
					message: `Failed to clean up database pool: ${String(cleanupError)}`,
					type: 'errors',
					location: 'dailyCartCleanup.poolCleanup',
				});
			}
		}
	},
});
