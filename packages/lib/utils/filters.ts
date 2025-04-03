import { z } from 'zod';

import { queryBooleanSchema } from './zod-helpers';

export const commonFiltersSchema = z.object({
	search: z.string().optional(),
	showArchived: queryBooleanSchema.optional(),
	showDeleted: queryBooleanSchema.optional(),
});

export const infiniteQuerySchema = z.object({
	handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const platformFiltersSchema = z.object({
	showSpotify: queryBooleanSchema.optional(),
	showAppleMusic: queryBooleanSchema.optional(),
	showYoutube: queryBooleanSchema.optional(),
	showAmazonMusic: queryBooleanSchema.optional(),
	showYoutubeMusic: queryBooleanSchema.optional(),
});

export const cartFiltersSchema = z.object({
	showEmailAdds: queryBooleanSchema.optional(),
	showShippingInfoAdds: queryBooleanSchema.optional(),
	showPaymentInfoAdds: queryBooleanSchema.optional(),
	showMainWithoutBumpPurchases: queryBooleanSchema.optional(),
	showMainWithBumpPurchases: queryBooleanSchema.optional(),
	showUpsellPurchases: queryBooleanSchema.optional(),
	showUpsellDeclines: queryBooleanSchema.optional(),

	showPurchases: queryBooleanSchema.optional(),
	showGrossSales: queryBooleanSchema.optional(),
	showProductSales: queryBooleanSchema.optional(),
	showNetSales: queryBooleanSchema.optional(),
});

export const pageFiltersSchema = cartFiltersSchema.extend({
	showVisits: queryBooleanSchema.optional(),
	showClicks: queryBooleanSchema.optional(),
});
