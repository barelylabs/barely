import type { UpdateCart } from '@barely/validators';
import { dbHttp } from '@barely/db/client';
import { Carts } from '@barely/db/sql';
import { logger, schedules, task, wait } from '@trigger.dev/sdk/v3';
import { and, eq, lt } from 'drizzle-orm';

import { funnelWith, sendCartReceiptEmail } from '../functions/cart.fns';

export const handleAbandonedUpsell = task({
	id: 'handle-abandoned-upsell',
	run: async (payload: { cartId: string }) => {
		/* we're looking for carts that make it to the upsellCreated stage 
        but aren't converted or declined within 5 min */

		logger.log('Checking for abandoned upsell cart ' + payload.cartId + ' in 5 minutes');
		await wait.for({ seconds: 5 * 60 + 15 }); // 5 minutes and 15 seconds

		const cart = await dbHttp.query.Carts.findFirst({
			where: and(eq(Carts.id, payload.cartId), eq(Carts.stage, 'upsellCreated')),
			with: {
				funnel: { with: funnelWith },
				fan: true,
			},
		});

		if (!cart) {
			logger.log(`cart already converted or declined: ${payload.cartId}`);
			return;
		}

		const updateCartData: UpdateCart = {
			id: cart.id,
			stage: 'upsellAbandoned',
		};

		if (cart.email && cart.funnel && cart.fan) {
			await sendCartReceiptEmail({
				...cart,
				fan: cart.fan,
				funnel: cart.funnel,
				mainProduct: cart.funnel.mainProduct,
				bumpProduct: cart.funnel.bumpProduct,
				upsellProduct: cart.funnel.upsellProduct,
			});
			updateCartData.orderReceiptSent = true;
		}

		await dbHttp.update(Carts).set(updateCartData).where(eq(Carts.id, cart.id));

		logger.log('Cart abandoned: ' + cart.id);
	},
	handleError: error => {
		logger.error('Error handling abandoned upsell cart', error);
	},
});

export const handleAbandonedUpsells = schedules.task({
	id: 'handle-abandoned-upsell-carts',
	run: async payload => {
		const carts = await dbHttp.query.Carts.findMany({
			with: {
				funnel: { with: funnelWith },
				fan: true,
			},
			where: and(
				eq(Carts.stage, 'upsellCreated'),
				eq(Carts.orderReceiptSent, false),
				lt(
					Carts.checkoutConvertedAt,
					new Date(payload.timestamp.getTime() - 5 * 60 * 1000),
				), // upsells created more than 5 minutes ago
			),
		});

		await Promise.allSettled(
			carts.map(async cart => {
				const updateCartData: UpdateCart = {
					id: cart.id,
					stage: 'upsellAbandoned',
				};

				if (cart.email && cart.funnel && cart.fan) {
					await sendCartReceiptEmail({
						...cart,
						fan: cart.fan,
						funnel: cart.funnel,
						mainProduct: cart.funnel.mainProduct,
						bumpProduct: cart.funnel.bumpProduct,
						upsellProduct: cart.funnel.upsellProduct,
					});
					updateCartData.orderReceiptSent = true;
				}

				return await dbHttp
					.update(Carts)
					.set(updateCartData)
					.where(eq(Carts.id, cart.id));
			}),
		);
	},
});
