import { CART_STAGES } from '@barely/db/sql';
import { z } from 'zod/v4';

export const stripeConnectChargeMetadataSchema = z.object({
	cartId: z.string(),
	preChargeCartStage: z.enum(CART_STAGES),
});
