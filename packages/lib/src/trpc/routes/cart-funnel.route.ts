import type { InsertCartFunnel } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { CartFunnels } from '@barely/db/sql/cart-funnel.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError, sanitizeKey } from '@barely/utils';
import {
	createCartFunnelSchema,
	selectWorkspaceCartFunnelsSchema,
	updateCartFunnelSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { workspaceProcedure } from '../trpc';

export const cartFunnelRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceCartFunnelsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;
			const funnels = await dbHttp.query.CartFunnels.findMany({
				where: sqlAnd([
					eq(CartFunnels.workspaceId, ctx.workspace.id),
					!!search.length && sqlStringContains(CartFunnels.name, search),
					!!cursor &&
						or(
							lt(CartFunnels.createdAt, cursor.createdAt),
							and(
								eq(CartFunnels.createdAt, cursor.createdAt),
								gt(CartFunnels.id, cursor.id),
							),
						),
					showArchived ? undefined : isNull(CartFunnels.archivedAt),
					showDeleted ? undefined : isNull(CartFunnels.deletedAt),
				]),
				with: {
					mainProduct: true,
				},
				orderBy: [desc(CartFunnels.createdAt), asc(CartFunnels.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (funnels.length > limit) {
				const nextFunnel = funnels.pop();
				nextCursor =
					nextFunnel ?
						{
							id: nextFunnel.id,
							createdAt: nextFunnel.createdAt,
						}
					:	undefined;
			}

			return {
				cartFunnels: funnels.slice(0, limit),
				nextCursor,
			};
		}),

	create: workspaceProcedure
		.input(createCartFunnelSchema)
		.mutation(async ({ input, ctx }) => {
			const funnelData: InsertCartFunnel = {
				...input,
				id: newId('cartFunnel'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
				key: sanitizeKey(input.key),
			};

			const funnel = await dbHttp.insert(CartFunnels).values(funnelData).returning();

			return funnel[0] ?? raiseTRPCError({ message: 'Error creating funnel' });
		}),

	update: workspaceProcedure
		.input(updateCartFunnelSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedFunnel = await dbHttp
				.update(CartFunnels)
				.set({
					...input,
					key: input.key ? sanitizeKey(input.key) : undefined,
				})
				.where(
					and(
						eq(CartFunnels.id, input.id),
						eq(CartFunnels.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedFunnel[0] ?? raiseTRPCError({ message: 'Error updating funnel' });
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFunnel = await dbHttp
				.update(CartFunnels)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(CartFunnels.workspaceId, ctx.workspace.id),
						inArray(CartFunnels.id, input.ids),
					),
				)
				.returning();

			return updatedFunnel[0] ?? raiseTRPCError({ message: 'Error archiving funnel' });
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFunnel = await dbHttp
				.update(CartFunnels)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(CartFunnels.workspaceId, ctx.workspace.id),
						inArray(CartFunnels.id, input.ids),
					),
				)
				.returning();

			return updatedFunnel[0] ?? raiseTRPCError({ message: 'Error deleting funnel' });
		}),
} satisfies TRPCRouterRecord;
