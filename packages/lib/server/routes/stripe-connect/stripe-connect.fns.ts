import { tasks } from '@trigger.dev/sdk/v3';
import { and, eq, or } from 'drizzle-orm';
import { Stripe } from 'stripe';

import type { handleAbandonedUpsell } from '../../../trigger/cart.trigger';
import type { handleFlow } from '../../../trigger/flow.trigger';
import type { UpdateCart } from '../cart/cart.schema';
import type { Workspace } from '../workspace/workspace.schema';
import { isProduction } from '../../../utils/environment';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import { stripe } from '../../stripe';
import {
	createOrderIdForCart,
	getCartById,
	incrementAssetValuesOnCartPurchase,
	sendCartReceiptEmail,
} from '../cart/cart.fns';
import { Carts } from '../cart/cart.sql';
import { recordCartEvent } from '../event/event.fns';
import { createFan } from '../fan/fan.fns';
import { Fans } from '../fan/fan.sql';
import { Flow_Triggers } from '../flow/flow.sql';
import { stripeConnectChargeMetadataSchema } from './stripe-connect.schema';

export async function handleStripeConnectChargeSuccess(charge: Stripe.Charge) {
	const { cartId, preChargeCartStage } = stripeConnectChargeMetadataSchema.parse(
		charge.metadata,
	);

	const prevCart = (await getCartById(cartId)) ?? raise('cart not found');
	const cartFunnel = prevCart.funnel ?? raise('funnel not found');

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
	if (
		preChargeCartStage === 'checkoutCreated' ||
		preChargeCartStage === 'checkoutAbandoned'
	) {
		const updateCart: UpdateCart = { id: prevCart.id };

		updateCart.orderId = await createOrderIdForCart(prevCart);

		updateCart.stage =
			cartFunnel?.upsellProductId ? 'upsellCreated' : 'checkoutConverted';
		updateCart.checkoutStripeChargeId = charge.id;
		updateCart.checkoutStripePaymentMethodId = charge.payment_method;

		updateCart.fullName =
			charge.shipping?.name ?? charge.billing_details.name ?? prevCart.fullName;
		updateCart.shippingAddressLine1 = charge.shipping?.address?.line1;
		updateCart.shippingAddressLine2 = charge.shipping?.address?.line2;
		updateCart.shippingAddressCity = charge.shipping?.address?.city;
		updateCart.shippingAddressState = charge.shipping?.address?.state;
		updateCart.shippingAddressPostalCode = charge.shipping?.address?.postal_code;
		updateCart.shippingAddressCountry = charge.shipping?.address?.country;
		updateCart.checkoutConvertedAt = new Date();

		// update or create fan
		let fan =
			prevCart.fan ? prevCart.fan
			: (stripeCustomerId ?? charge.billing_details.email) ?
				await dbHttp.query.Fans.findFirst({
					where: or(
						charge.billing_details.email ?
							eq(Fans.email, charge.billing_details.email)
						:	undefined,
						stripeCustomerId ? eq(Fans.stripeCustomerId, stripeCustomerId) : undefined,
					),
				})
			:	undefined;

		if (fan) {
			updateCart.fanId = fan.id;
			await dbHttp
				.update(Fans)
				.set({
					stripeCustomerId,
					stripePaymentMethodId: charge.payment_method,
				})
				.where(eq(Fans.id, fan.id));
		} else {
			fan = await createFan({
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

				emailMarketingOptIn: prevCart.emailMarketingOptIn ?? false,
				smsMarketingOptIn: prevCart.smsMarketingOptIn ?? false,
			});
			updateCart.fanId = fan.id;
		}

		const updatedCart = (
			await dbHttp.update(Carts).set(updateCart).where(eq(Carts.id, cartId)).returning()
		)[0] ?? {
			...prevCart,
			...updateCart,
		};

		await recordCartEvent({
			cart: updatedCart,
			cartFunnel: cartFunnel,
			type:
				updatedCart.addedBump ?
					'cart/purchaseMainWithBump'
				:	'cart/purchaseMainWithoutBump',
		}).catch(err => {
			console.log('error recording cart event:', err);
		});

		if (!fan) throw new Error('Fan not created or found after charge success');

		// increment value
		await incrementAssetValuesOnCartPurchase(
			prevCart,
			prevCart.addedBump ?
				prevCart.mainProductPrice + (prevCart.bumpProductPrice ?? 0)
			:	prevCart.mainProductPrice,
		);

		if (updateCart.stage === 'upsellCreated') {
			await tasks.trigger<typeof handleAbandonedUpsell>('handle-abandoned-upsell', {
				cartId: prevCart.id,
			}); // this waits 5 minutes and then marks the cart abandoned if it hasn't been converted or declined
		} else if (updateCart.stage === 'checkoutConverted') {
			await sendCartReceiptEmail({
				...prevCart,
				...updateCart,
				fan,
				funnel: cartFunnel,
				mainProduct: cartFunnel.mainProduct,
				bumpProduct: cartFunnel.bumpProduct,
				upsellProduct: cartFunnel.upsellProduct,
			});
		}

		// check for any triggers
		const newCartOrderTriggers = await dbHttp.query.Flow_Triggers.findMany({
			where: and(
				eq(Flow_Triggers.type, 'newCartOrder'),
				eq(Flow_Triggers.cartFunnelId, cartFunnel.id),
			),
		});

		for (const trigger of newCartOrderTriggers) {
			// todo: abstract this to a function. require cartOrderId and fanId
			await tasks.trigger<typeof handleFlow>('handle-flow', {
				triggerId: trigger.id,
				cartId: prevCart.id,
				fanId: fan.id,
			});
		}

		// newFan triggers
		if (!prevCart.fan && fan) {
			// i.e. we just created a fan
			const newFanTriggers = await dbHttp.query.Flow_Triggers.findMany({
				where: and(
					eq(Flow_Triggers.type, 'newFan'),
					eq(Flow_Triggers.workspaceId, prevCart.workspaceId),
				),
			});

			for (const trigger of newFanTriggers) {
				// todo: abstract this to a function. require fanId
				await tasks.trigger<typeof handleFlow>('handle-flow', {
					triggerId: trigger.id,
					fanId: fan.id,
				});
			}
		}
	}
}

export function getStripeConnectAccountId(
	workspace: Pick<Workspace, 'stripeConnectAccountId' | 'stripeConnectAccountId_devMode'>,
) {
	return isProduction() ?
			workspace.stripeConnectAccountId
		:	workspace.stripeConnectAccountId_devMode;
}
