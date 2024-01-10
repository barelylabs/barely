import { z } from "zod";

export const stripeTransactionMetadataSchema = z.object({
  createdById: z.string().optional(),
  workspaceId: z.string(),
});

export const stripeLineItemMetadataSchema = z.object({
  campaignId: z.string().optional(),
});

export type StripeTransactionMetadata = z.infer<
  typeof stripeTransactionMetadataSchema
>;
export type StripeLineItemMetadata = z.infer<
  typeof stripeLineItemMetadataSchema
>;
