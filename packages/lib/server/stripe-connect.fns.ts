import { eq, or } from 'drizzle-orm';
import { Stripe } from 'stripe';

import type { UpdateCart } from './cart.schema';
import type { Workspace } from './workspace.schema';
import { env } from '../env';
import { isProduction } from '../utils/environment';
import { newId } from '../utils/id';
import { raise } from '../utils/raise';
import { getCartById, sendCartReceiptEmail } from './cart.fns';
import { Carts } from './cart.sql';
import { db } from './db';
import { Fans } from './fan.sql';
import { stripeConnectChargeMetadataSchema } from './stripe-connect.schema';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
	httpClient: Stripe.createFetchHttpClient(),
});

export async function handleStripeConnectChargeSuccess(charge: Stripe.Charge) {
	const { cartId, preChargeCartStage } = stripeConnectChargeMetadataSchema.parse(
		charge.metadata,
	);

	const prevCart = (await getCartById(cartId)) ?? raise('cart not found');
	const funnel = prevCart.funnel ?? raise('funnel not found');

	let stripeCustomerId =
		typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;

	if (!stripeCustomerId) {
		try {
			const customer = await stripe.customers.create(
				{
					name: charge.billing_details.name ?? undefined,
					email: charge.billing_details.email ?? undefined,
					payment_method: charge.payment_method ?? undefined,
				},
				{
					stripeAccount:
						getStripeConnectAccountId(prevCart.workspace) ??
						raise('stripeConnectAccountId not found'),
				},
			);

			stripeCustomerId = customer.id;
		} catch (err) {
			if (err instanceof Stripe.errors.StripeError) {
				console.log('error:', err);
				if (err.type === 'StripeInvalidRequestError') {
					// try to find the customer by email
					const customers = await stripe.customers.list({
						email: charge.billing_details.email ?? undefined,
					});

					if (customers.data[0]) {
						stripeCustomerId = customers.data[0].id;
					}
				}
			}
		}
	}

	/* update cart */
	if (preChargeCartStage === 'mainCreated' || preChargeCartStage === 'mainAbandoned') {
		console.log('this is the first payment since the cart was created');

		const updateCart: UpdateCart = { id: prevCart.id };

		updateCart.stage = funnel?.upsellProductId ? 'upsellCreated' : 'mainConverted';
		updateCart.mainStripeChargeId = charge.id;
		updateCart.mainStripePaymentMethodId = charge.payment_method;

		// update or create fan
		const fan = prevCart.fan
			? prevCart.fan
			: stripeCustomerId ?? charge.billing_details.email
				? await db.pool.query.Fans.findFirst({
						where: or(
							charge.billing_details.email
								? eq(Fans.email, charge.billing_details.email)
								: undefined,
							stripeCustomerId ? eq(Fans.stripeCustomerId, stripeCustomerId) : undefined,
						),
					})
				: undefined;

		console.log('existing fan:', fan);

		if (fan) {
			updateCart.fanId = fan.id;
			await db.pool
				.update(Fans)
				.set({
					stripeCustomerId,
					stripePaymentMethodId: charge.payment_method,
				})
				.where(eq(Fans.id, fan.id));
		} else {
			console.log('creating new fan');
			const fan =
				(
					await db.pool
						.insert(Fans)
						.values({
							id: newId('fan'),
							workspaceId: prevCart.workspaceId,
							fullName: charge.billing_details.name ?? prevCart.fullName ?? '',
							email: charge.billing_details.email ?? prevCart.email ?? '',

							shippingAddressLine1: charge.shipping?.address?.line1,
							shippingAddressLine2: charge.shipping?.address?.line2,
							shippingAddressCity: charge.shipping?.address?.city,
							shippingAddressState: charge.shipping?.address?.state,
							shippingAddressPostalCode: charge.shipping?.address?.postal_code,
							shippingAddressCountry: charge.shipping?.address?.country,

							billingAddressPostalCode: charge.billing_details.address?.postal_code,
							billingAddressCountry: charge.billing_details.address?.country,

							stripeCustomerId,
							stripePaymentMethodId: charge.payment_method,
						})
						.returning()
				)[0] ?? raise('error creating new fan');
			console.log('new fan:', fan);
			updateCart.fanId = fan.id;
		}

		await db.pool.update(Carts).set(updateCart).where(eq(Carts.id, cartId));

		if (!fan) throw new Error('Fan not found');

		if (updateCart.stage === 'mainConverted') {
			await sendCartReceiptEmail({
				...prevCart,
				...updateCart,
				fan,
				funnel,
				mainProduct: funnel.mainProduct,
				bumpProduct: funnel.bumpProduct,
				upsellProduct: funnel.upsellProduct,
			});
		}
	}

	// switch (true) {
	// 	/* this is the first payment since the cart was created */
	// 	case preChargeCartStage === 'mainCreated' || preChargeCartStage === 'mainAbandoned': {
	// 		console.log('this is the first payment since the cart was created');

	// 		const updateCart: UpdateCart = { id: prevCart.id };

	// 		updateCart.stage = funnel?.upsellProductId ? 'upsellCreated' : 'mainConverted';
	// 		updateCart.mainStripeChargeId = charge.id;
	// 		updateCart.mainStripePaymentMethodId = charge.payment_method;

	// 		// update or create fan
	// 		const fan = prevCart.fan
	// 			? prevCart.fan
	// 			: stripeCustomerId ?? charge.billing_details.email
	// 				? await db.pool.query.Fans.findFirst({
	// 						where: or(
	// 							charge.billing_details.email
	// 								? eq(Fans.email, charge.billing_details.email)
	// 								: undefined,
	// 							stripeCustomerId
	// 								? eq(Fans.stripeCustomerId, stripeCustomerId)
	// 								: undefined,
	// 						),
	// 					})
	// 				: undefined;

	// 		if (fan) {
	// 			updateCart.fanId = fan.id;
	// 			await db.pool
	// 				.update(Fans)
	// 				.set({
	// 					stripeCustomerId,
	// 					stripePaymentMethodId: charge.payment_method,
	// 				})
	// 				.where(eq(Fans.id, fan.id));
	// 		} else {
	// 			const fan =
	// 				(
	// 					await db.pool
	// 						.insert(Fans)
	// 						.values({
	// 							id: newId('fan'),
	// 							workspaceId: prevCart.workspaceId,
	// 							fullName: charge.billing_details.name ?? prevCart.fullName ?? '',
	// 							email: charge.billing_details.email ?? prevCart.email ?? '',

	// 							shippingAddressLine1: charge.shipping?.address?.line1,
	// 							shippingAddressLine2: charge.shipping?.address?.line2,
	// 							shippingAddressCity: charge.shipping?.address?.city,
	// 							shippingAddressState: charge.shipping?.address?.state,
	// 							shippingAddressPostalCode: charge.shipping?.address?.postal_code,
	// 							shippingAddressCountry: charge.shipping?.address?.country,

	// 							billingAddressPostalCode: charge.billing_details.address?.postal_code,
	// 							billingAddressCountry: charge.billing_details.address?.country,

	// 							stripeCustomerId,
	// 							stripePaymentMethodId: charge.payment_method,
	// 						})
	// 						.returning()
	// 				)[0] ?? raise('error creating new fan');
	// 			updateCart.fanId = fan.id;
	// 		}

	// 		await db.pool.update(Carts).set(updateCart).where(eq(Carts.id, cartId));

	// 		if (!fan) throw new Error('Fan not found');

	// 		await sendCartReceiptEmail({
	// 			...prevCart,
	// 			...updateCart,
	// 			fan,
	// 			funnel,
	// 		});

	// 		break;
	// 	}
	// }
}

export function getStripeConnectAccountId(
	workspace: Pick<Workspace, 'stripeConnectAccountId' | 'stripeConnectAccountId_devMode'>,
) {
	return isProduction()
		? workspace.stripeConnectAccountId
		: workspace.stripeConnectAccountId_devMode;
}
