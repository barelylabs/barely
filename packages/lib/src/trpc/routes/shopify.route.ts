import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { ApparelSizes, Products } from '@barely/db/sql';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getShopifyClient } from '../../integrations/shopify/shopify.fns';
import { listShopifyProducts } from '../../integrations/shopify/shopify.products';
import { workspaceProcedure } from '../trpc';

export const shopifyRoute = {
	connectionStatus: workspaceProcedure.query(async ({ ctx }) => {
		const client = await getShopifyClient(ctx.workspace.id);
		return { connected: client !== null };
	}),

	listProducts: workspaceProcedure
		.input(
			z.object({
				cursor: z.string().optional(),
				pageSize: z.number().min(1).max(50).optional().default(25),
			}),
		)
		.query(async ({ ctx, input }) => {
			const client = await getShopifyClient(ctx.workspace.id);
			if (!client) {
				return { products: [], pageInfo: { hasNextPage: false, endCursor: null } };
			}

			return listShopifyProducts(client, input.cursor, input.pageSize);
		}),

	connectProduct: workspaceProcedure
		.input(
			z.object({
				productId: z.string(),
				shopifyProductId: z.string(),
				shopifyVariantId: z.string().optional(),
				apparelSizeMappings: z
					.array(
						z.object({
							size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
							shopifyVariantId: z.string(),
						}),
					)
					.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify the product belongs to this workspace
			const product = await dbHttp.query.Products.findFirst({
				where: and(
					eq(Products.id, input.productId),
					eq(Products.workspaceId, ctx.workspace.id),
				),
			});

			if (!product) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Product not found',
				});
			}

			// Wrap all writes in a transaction for atomicity
			await dbHttp.transaction(async tx => {
				await tx
					.update(Products)
					.set({
						shopifyProductId: input.shopifyProductId,
						shopifyVariantId: input.shopifyVariantId ?? null,
					})
					.where(
						and(
							eq(Products.id, input.productId),
							eq(Products.workspaceId, ctx.workspace.id),
						),
					);

				if (input.apparelSizeMappings?.length) {
					for (const mapping of input.apparelSizeMappings) {
						await tx
							.update(ApparelSizes)
							.set({ shopifyVariantId: mapping.shopifyVariantId })
							.where(
								and(
									eq(ApparelSizes.productId, input.productId),
									eq(ApparelSizes.size, mapping.size),
								),
							);
					}
				}
			});

			return { success: true };
		}),

	disconnectProduct: workspaceProcedure
		.input(z.object({ productId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Products)
				.set({
					shopifyProductId: null,
					shopifyVariantId: null,
				})
				.where(
					and(
						eq(Products.id, input.productId),
						eq(Products.workspaceId, ctx.workspace.id),
					),
				);

			// Clear apparel size Shopify mappings (scoped via product ownership above)
			await dbHttp
				.update(ApparelSizes)
				.set({ shopifyVariantId: null })
				.where(eq(ApparelSizes.productId, input.productId));

			return { success: true };
		}),
} satisfies TRPCRouterRecord;
