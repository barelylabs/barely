import { z } from 'zod';

import { CART_STAGES } from '../cart/cart.sql';

export const stripeConnectChargeMetadataSchema = z.object({
	cartId: z.string(),
	preChargeCartStage: z.enum(CART_STAGES),
});
