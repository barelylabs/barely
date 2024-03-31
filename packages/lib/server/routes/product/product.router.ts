import { and, asc, desc, eq, gt, inArray, lt, notInArray, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import type { NormalizedProductWith_Images } from './product.schema';
import { getUserWorkspaceByHandle } from '../../../utils/auth';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { _Files_To_Products__Images } from '../file/file.sql';
import {
	createProductSchema,
	selectWorkspaceProductsSchema,
	updateProductSchema,
} from './product.schema';
import { ApparelSizes, Products } from './product.sql';

export const productRouter = createTRPCRouter({
	byWorkspace: privateProcedure
		.input(selectWorkspaceProductsSchema)
		.query(async ({ input, ctx }) => {
			const { handle, limit, cursor, search } = input;
			const workspace = getUserWorkspaceByHandle(ctx.user, handle);
			const products = await ctx.db.http.query.Products.findMany({
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
					eq(Products.workspaceId, workspace.id),
					!!search?.length && sqlStringContains(Products.name, search),
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
				nextCursor = nextProduct
					? {
							id: nextProduct?.id,
							createdAt: nextProduct?.createdAt,
						}
					: undefined;
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

	create: privateProcedure.input(createProductSchema).mutation(async ({ input, ctx }) => {
		const { _images, _apparelSizes, ...productData } = input;

		const productId = newId('product');

		const product = await ctx.db.http
			.insert(Products)
			.values({
				...productData,
				id: productId,
				workspaceId: ctx.workspace.id,
			})
			.returning();

		if (_images?.length) {
			const images = _images.map((_i, i) => ({
				productId,
				fileId: _i.fileId,
				lexorank: i.toString(),
			}));

			await ctx.db.http.insert(_Files_To_Products__Images).values(images).returning();
		}

		if (_apparelSizes?.length) {
			await ctx.db.http.insert(ApparelSizes).values(
				_apparelSizes.map(s => ({
					productId,
					size: s.size,
					stock: s.stock,
				})),
			);
		}

		return product[0] ?? raise('Failed to create product');
	}),

	update: privateProcedure.input(updateProductSchema).mutation(async ({ input, ctx }) => {
		console.log('input', input);

		const { _images, _apparelSizes, ...productUpdate } = input;

		const updatedProduct = await ctx.db.http
			.update(Products)
			.set(productUpdate)
			.where(and(eq(Products.id, input.id), eq(Products.workspaceId, ctx.workspace.id)))
			.returning();

		if (_images?.length) {
			// delete any images that are not in the new list
			await ctx.db.http.delete(_Files_To_Products__Images).where(
				and(
					eq(_Files_To_Products__Images.productId, input.id),
					notInArray(
						_Files_To_Products__Images.fileId,
						_images.map(i => i.fileId),
					),
				),
			);

			// upsert the images (we just update the lexorank if the fileId already exists)
			await ctx.db.pool
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
			await ctx.db.pool.delete(ApparelSizes).where(
				and(
					eq(ApparelSizes.productId, input.id),
					notInArray(
						ApparelSizes.size,
						_apparelSizes.map(i => i.size),
					),
				),
			);

			await ctx.db.pool
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

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedProduct = await ctx.db.http
				.update(Products)
				.set({ archived: true })
				.where(
					and(eq(Products.workspaceId, ctx.workspace.id), inArray(Products.id, input)),
				)
				.returning();
			return updatedProduct[0] ?? raise('Failed to archive product');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedProduct = await ctx.db.http
			.update(Products)
			.set({ deletedAt: new Date().toISOString() })
			.where(and(eq(Products.workspaceId, ctx.workspace.id), inArray(Products.id, input)))
			.returning();
		return updatedProduct[0] ?? raise('Failed to delete product');
	}),
});
