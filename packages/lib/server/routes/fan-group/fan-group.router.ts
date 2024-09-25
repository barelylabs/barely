import {
	and,
	asc,
	desc,
	eq,
	gt,
	inArray,
	isNotNull,
	isNull,
	lt,
	not,
	notInArray,
	or,
	sql,
} from 'drizzle-orm';
import { z } from 'zod';

import type { InsertFanGroupCondition } from './fan-group.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlCount, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { Carts } from '../cart/cart.sql';
import { Fans } from '../fan/fan.sql';
import { generateFanGroupConditions } from './fan-group.fns';
import {
	createFanGroupSchema,
	selectWorkspaceFanGroupsSchema,
	updateFanGroupSchema,
} from './fan-group.schema';
import { FanGroupConditions, FanGroups } from './fan-group.sql';

export const fanGroupRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceFanGroupsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;
			const fanGroups = await ctx.db.http.query.FanGroups.findMany({
				where: sqlAnd([
					eq(FanGroups.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(FanGroups.name, search),
					!!cursor &&
						or(
							lt(FanGroups.createdAt, cursor.createdAt),
							and(eq(FanGroups.createdAt, cursor.createdAt), gt(FanGroups.id, cursor.id)),
						),
					showArchived ? undefined : isNull(FanGroups.archivedAt),
				]),
				orderBy: [desc(FanGroups.createdAt), asc(FanGroups.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (fanGroups.length > limit) {
				const nextFanGroup = fanGroups.pop();
				nextCursor =
					nextFanGroup ?
						{
							id: nextFanGroup.id,
							createdAt: nextFanGroup.createdAt,
						}
					:	undefined;
			}

			return {
				fanGroups,
				nextCursor,
			};
		}),

	byId: workspaceQueryProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const fanGroup = await ctx.db.pool.query.FanGroups.findFirst({
				where: eq(FanGroups.id, input.id),
				with: {
					conditions: {
						orderBy: asc(FanGroupConditions.createdAt),
					},
				},
			});

			if (!fanGroup) return null;

			// count the number of fans that match the fan group conditions

			const {
				whereConditions: includeWhereConditions,
				havingConditions: includeHavingConditions,
			} = generateFanGroupConditions(
				fanGroup.conditions.filter(condition => !condition.exclude),
			);

			const {
				whereConditions: excludeWhereConditions,
				havingConditions: excludeHavingConditions,
			} = generateFanGroupConditions(
				fanGroup.conditions.filter(condition => condition.exclude),
			);

			// const includeHavingConditions = generateFanGroupConditions(
			// 	fanGroup.conditions.filter(
			// 		condition => !condition.exclude && condition.type === 'hasOrderedAmount',
			// 	),
			// );
			// const excludeHavingConditions = generateFanGroupConditions(
			// 	fanGroup.conditions.filter(
			// 		condition => condition.exclude && condition.type === 'hasOrderedAmount',
			// 	),
			// );

			console.log('includeWhereConditions', includeWhereConditions);
			console.log('excludeWhereConditions', excludeWhereConditions);
			console.log('includeHavingConditions', includeHavingConditions);
			console.log('excludeHavingConditions', excludeHavingConditions);

			const subquery = ctx.db.pool
				.select({
					fanId: Fans.id,
					totalAmount: sum(Carts.orderAmount),
				})
				.from(Fans)
				.leftJoin(
					Carts,
					sqlAnd([eq(Fans.id, Carts.fanId), isNotNull(Carts.checkoutConvertedAt)]),
				)
				.where(eq(Fans.workspaceId, ctx.workspace.id))
				.groupBy(Fans.id)
				.as('subquery');

			const countRes = await ctx.db.pool
				.select({
					count: sqlCount,
				})
				.from(Fans)
				.leftJoin(
					Carts,
					sqlAnd([eq(Fans.id, Carts.fanId), isNotNull(Carts.checkoutConvertedAt)]),
				)
				.where(
					sqlAnd([
						eq(Fans.workspaceId, ctx.workspace.id),
						includeWhereConditions.length ? or(...includeWhereConditions) : undefined,
						excludeWhereConditions.length ? or(...excludeWhereConditions) : undefined,
					]),
				);
			// .groupBy(Fans.id)
			// .having(
			// 	sqlAnd([
			// 		// includeHavingConditions.length ? or(...includeHavingConditions) : undefined,
			// 		// excludeHavingConditions.length ? or(...excludeHavingConditions) : undefined,
			// 	]),
			// );

			const count = countRes[0]?.count ?? 0;

			// find matching fans
			// const matchingFans = []
			// const matchingFans = await ctx.db.pool
			// 	.select({
			// 		id: Fans.id,
			// 		fullName: Fans.fullName,
			// 		email: Fans.email,
			// 		// Add more fields as needed
			// 	})
			// 	.from(Fans)
			// 	.leftJoin(Carts, eq(Fans.id, Carts.fanId))
			// 	.where(sqlAnd([eq(Fans.workspaceId, ctx.workspace.id), ...sqlConditions]))
			// 	.limit(10); // Adjust limit as needed

			const conditionsWithAny = fanGroup.conditions.map(condition => ({
				...condition,
				productId: condition.productId?.length ? condition.productId : 'any',
				cartFunnelId: condition.cartFunnelId?.length ? condition.cartFunnelId : 'any',
			}));

			return {
				...fanGroup,
				conditions: conditionsWithAny,
				count,
				// matchingFans,
			};
		}),

	create: privateProcedure
		.input(createFanGroupSchema)
		.mutation(async ({ input, ctx }) => {
			const { conditions, ...data } = input;

			const fanGroupData = {
				...data,
				id: newId('fanGroup'),
				workspaceId: ctx.workspace.id,
			};

			const fanGroups = await ctx.db.pool
				.insert(FanGroups)
				.values(fanGroupData)
				.returning();
			const fanGroup = fanGroups[0] ?? raise('Failed to create fan group');

			if (conditions.length > 0) {
				const fanGroupConditions = conditions.map((condition, index) => ({
					...condition,
					id: newId('fanGroupCondition'),
					fanGroupId: fanGroup.id,
					index,
				})) satisfies InsertFanGroupCondition[];

				await ctx.db.pool.insert(FanGroupConditions).values(fanGroupConditions);
			}

			return fanGroup;
		}),

	update: privateProcedure
		.input(updateFanGroupSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, conditions, ...data } = input;

			await ctx.db.pool
				.update(FanGroups)
				.set(data)
				.where(and(eq(FanGroups.id, id), eq(FanGroups.workspaceId, ctx.workspace.id)))
				.returning();

			if (conditions !== undefined) {
				const conditionIds = conditions
					.map(condition => condition.id)
					.filter(id => id !== undefined);

				await Promise.all(
					conditions.map(async condition => {
						if (
							condition.type !== 'hasOrderedProduct' ||
							(condition.type === 'hasOrderedProduct' && condition.productId === 'any')
						) {
							condition.productId = null;
						}
						if (
							condition.type !== 'hasOrderedCart' ||
							(condition.type === 'hasOrderedCart' && condition.cartFunnelId === 'any')
						) {
							condition.cartFunnelId = null;
						}

						if (condition.id) {
							await ctx.db.pool
								.update(FanGroupConditions)
								.set(condition)
								.where(eq(FanGroupConditions.id, condition.id));
						} else {
							const newConditionId = newId('fanGroupCondition');
							await ctx.db.pool.insert(FanGroupConditions).values({
								...condition,
								id: newConditionId,
								fanGroupId: id,
								productId: condition.productId ?? null,
								cartFunnelId: condition.cartFunnelId ?? null,
							});
							conditionIds.push(newConditionId);
						}
					}),
				);

				// remove any conditions that are not in the new conditions
				if (conditionIds.length > 0) {
					await ctx.db.pool
						.delete(FanGroupConditions)
						.where(
							and(
								eq(FanGroupConditions.fanGroupId, id),
								notInArray(FanGroupConditions.id, conditionIds),
							),
						);
				}
			}
		}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedFanGroup = await ctx.db.http
				.update(FanGroups)
				.set({ archivedAt: new Date() })
				.where(inArray(FanGroups.id, input));

			return updatedFanGroup;
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedFanGroup = await ctx.db.http
			.update(FanGroups)
			.set({ deletedAt: new Date() })
			.where(inArray(FanGroups.id, input))
			.returning();

		return updatedFanGroup[0] ?? raise('Failed to delete fan group');
	}),
});
