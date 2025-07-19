import type { NormalizedProductWith_Images } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { _Files_To_Products__Images } from '@barely/db/sql/file.sql';
import { ApparelSizes, Products } from '@barely/db/sql/product.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import {
	createProductSchema,
	selectWorkspaceProductsSchema,
	updateProductSchema,
} from '@barely/validators';
import {
	and,
	asc,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	lt,
	notInArray,
	or,
	sql,
} from 'drizzle-orm';
import { z } from 'zod/v4';

import { workspaceProcedure } from '../trpc';

export const productRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceProductsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;

			const products = await dbHttp.query.Products.findMany({
				with: {
					_images: {
						columns: {
							lexorank: true,
						},
						with: {
							file: true,
						},
					},
					_apparelSizes: true,
				},
				where: sqlAnd([
					eq(Products.workspaceId, ctx.workspace.id),
					!!search.length && sqlStringContains(Products.name, search),
					showArchived ? undefined : isNull(Products.archivedAt),
					showDeleted ? undefined : isNull(Products.deletedAt),
					!!cursor &&
						or(
							lt(Products.createdAt, cursor.createdAt),
							and(eq(Products.createdAt, cursor.createdAt), gt(Products.id, cursor.id)),
						),
				]),
				orderBy: [desc(Products.createdAt), asc(Products.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (products.length > limit) {
				const nextProduct = products.pop();
				nextCursor =
					nextProduct ?
						{
							id: nextProduct.id,
							createdAt: nextProduct.createdAt,
						}
					:	undefined;
			}

			const normalizedProducts = products.map(p => {
				const { _images, _apparelSizes, ...product } = p;
				return {
					...product,
					_apparelSizes,
					images: _images.map(_i => ({ ..._i.file, lexorank: _i.lexorank })),
				};
			}) satisfies NormalizedProductWith_Images[];

			return {
				products: normalizedProducts.slice(0, limit),
				nextCursor,
			};
		}),

	create: workspaceProcedure
		.input(createProductSchema)
		.mutation(async ({ input, ctx }) => {
			const { _images, _apparelSizes, ...productData } = input;
			const { name, ...restOfProductData } = productData;
			const productId = newId('product');

			const product = await dbHttp
				.insert(Products)
				.values({
					...restOfProductData,
					name,
					id: productId,
					workspaceId: ctx.workspace.id,
				})
				.returning();

			if (_images?.length) {
				const images = _images.map(_i => ({
					productId,
					fileId: _i.fileId,
					lexorank: _i.lexorank,
				}));

				await dbHttp.insert(_Files_To_Products__Images).values(images).returning();
			}

			if (_apparelSizes?.length) {
				await dbHttp.insert(ApparelSizes).values(
					_apparelSizes.map(s => ({
						productId,
						size: s.size,
						stock: s.stock,
					})),
				);
			}

			return product[0] ?? raise('Failed to create product');
		}),

	update: workspaceProcedure
		.input(updateProductSchema)
		.mutation(async ({ input, ctx }) => {
			console.log('input', input);

			const { _images, _apparelSizes, ...productUpdate } = input;

			const updatedProduct = await dbHttp
				.update(Products)
				.set(productUpdate)
				.where(and(eq(Products.id, input.id), eq(Products.workspaceId, ctx.workspace.id)))
				.returning();

			if (_images?.length) {
				// delete any images that are not in the new list
				await dbHttp.delete(_Files_To_Products__Images).where(
					and(
						eq(_Files_To_Products__Images.productId, input.id),
						notInArray(
							_Files_To_Products__Images.fileId,
							_images.map(i => i.fileId),
						),
					),
				);

				// upsert the images (we just update the lexorank if the fileId already exists)
				await dbPool(ctx.pool)
					.insert(_Files_To_Products__Images)
					.values(
						_images.map(i => ({
							productId: input.id,
							fileId: i.fileId,
							lexorank: i.lexorank,
						})),
					)
					.onConflictDoUpdate({
						target: [
							_Files_To_Products__Images.productId,
							_Files_To_Products__Images.fileId,
						],
						set: {
							lexorank: sql`EXCLUDED.lexorank`,
						},
					});
			}

			if (_apparelSizes?.length) {
				await dbPool(ctx.pool)
					.delete(ApparelSizes)
					.where(
						and(
							eq(ApparelSizes.productId, input.id),
							notInArray(
								ApparelSizes.size,
								_apparelSizes.map(i => i.size),
							),
						),
					);

				await dbPool(ctx.pool)
					.insert(ApparelSizes)
					.values(
						_apparelSizes.map(s => ({
							productId: input.id,
							size: s.size,
							stock: s.stock,
						})),
					)
					.onConflictDoUpdate({
						target: [ApparelSizes.productId, ApparelSizes.size],
						set: {
							stock: sql`EXCLUDED.stock`,
						},
					});
			}

			return updatedProduct[0] ?? raise('Failed to update product');
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const archivedProduct = await dbHttp
				.update(Products)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(Products.workspaceId, ctx.workspace.id),
						inArray(Products.id, input.ids),
					),
				)
				.returning();
			return archivedProduct[0] ?? raise('Failed to archive product');
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedProduct = await dbHttp
				.update(Products)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(Products.workspaceId, ctx.workspace.id),
						inArray(Products.id, input.ids),
					),
				)
				.returning();
			return updatedProduct[0] ?? raise('Failed to delete product');
		}),
} satisfies TRPCRouterRecord;
