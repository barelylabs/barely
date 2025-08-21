import { CART_STAGES } from '@barely/db/sql';
import { z } from 'zod/v4';

export const stripeConnectChargeMetadataSchema = z.discriminatedUnion('paymentType', [
	z.object({
		paymentType: z.literal('cart'),
		cartId: z.string(),
		preChargeCartStage: z.enum(CART_STAGES),
	}),
	z.object({
		paymentType: z.literal('invoice'),
		invoiceId: z.string(),
		workspaceId: z.string(),
	}),
]);
