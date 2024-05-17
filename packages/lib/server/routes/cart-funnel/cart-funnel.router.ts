import { and, asc, desc, eq, gt, inArray, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { InsertCartFunnel } from './cart-funnel.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createCartFunnelSchema,
	selectWorkspaceCartFunnelsSchema,
	updateCartFunnelSchema,
} from './cart-funnel.schema';
import { CartFunnels } from './cart-funnel.sql';

export const cartFunnelRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceCartFunnelsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const funnels = await ctx.db.http.query.CartFunnels.findMany({
				where: sqlAnd([
					eq(CartFunnels.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(CartFunnels.name, search),
					!!cursor &&
						or(
							lt(CartFunnels.createdAt, cursor.createdAt),
							and(
								eq(CartFunnels.createdAt, cursor.createdAt),
								gt(CartFunnels.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(CartFunnels.createdAt), asc(CartFunnels.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (funnels.length > limit) {
				const nextFunnel = funnels.pop();
				nextCursor =
					nextFunnel ?
						{
							id: nextFunnel?.id,
							createdAt: nextFunnel?.createdAt,
						}
					:	undefined;
			}

			return {
				cartFunnels: funnels.slice(0, limit),
				nextCursor,
			};
		}),

	create: privateProcedure
		.input(createCartFunnelSchema)
		.mutation(async ({ input, ctx }) => {
			const funnelData: InsertCartFunnel = {
				...input,
				id: newId('cartFunnel'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
			};

			const funnel = await ctx.db.http.insert(CartFunnels).values(funnelData).returning();

			return funnel[0] ?? raise('Error creating funnel');
		}),

	update: privateProcedure
		.input(updateCartFunnelSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedFunnel = await ctx.db.http
				.update(CartFunnels)
				.set(input)
				.where(
					and(
						eq(CartFunnels.id, input.id),
						eq(CartFunnels.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedFunnel[0] ?? raise('Error updating funnel');
		}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedFunnel = await ctx.db.http
				.update(CartFunnels)
				.set({ archived: true })
				.where(
					and(
						eq(CartFunnels.workspaceId, ctx.workspace.id),
						inArray(CartFunnels.id, input),
					),
				)
				.returning();

			return updatedFunnel[0] ?? raise('Error archiving funnel');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedFunnel = await ctx.db.http
			.update(CartFunnels)
			.set({ deletedAt: new Date().toISOString() })
			.where(
				and(
					eq(CartFunnels.workspaceId, ctx.workspace.id),
					inArray(CartFunnels.id, input),
				),
			)
			.returning();

		return updatedFunnel[0] ?? raise('Error deleting funnel');
	}),
});
