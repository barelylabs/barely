import type { TRPCRouterRecord } from '@trpc/server';
import { WORKSPACE_PLAN_TYPES, WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { Carts } from '@barely/db/sql/cart.sql';
import { Fans } from '@barely/db/sql/fan.sql';
import { _Users_To_Workspaces, Users } from '@barely/db/sql/user.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { asc, count, desc, eq, gte, inArray, isNotNull, lte, ne, or, sql } from 'drizzle-orm';
import { z } from 'zod/v4';

import { adminProcedure } from '../trpc';

const dateRangeInput = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

const paginationInput = z.object({
	cursor: z.number().default(0),
	limit: z.number().default(20),
	search: z.string().optional(),
});

export const adminRoute = {
	overview: adminProcedure.query(async () => {
		const [userCount, workspaceStats, fanCount, revenueResult] = await Promise.all([
			// Total users
			dbHttp
				.select({ count: sqlCount })
				.from(Users)
				.then(r => r[0]?.count ?? 0),

			// Workspace counts by plan
			dbHttp
				.select({
					plan: Workspaces.plan,
					count: count(),
				})
				.from(Workspaces)
				.where(ne(Workspaces.type, 'personal'))
				.groupBy(Workspaces.plan),

			// Total fans
			dbHttp
				.select({ count: sqlCount })
				.from(Fans)
				.then(r => r[0]?.count ?? 0),

			// Total revenue from converted carts
			dbHttp
				.select({
					totalRevenue: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.mapWith(
						Number,
					),
					orderCount: sqlCount,
				})
				.from(Carts)
				.where(isNotNull(Carts.checkoutConvertedAt))
				.then(r => r[0] ?? { totalRevenue: 0, orderCount: 0 }),
		]);

		// Calculate MRR from workspace plans
		let mrr = 0;
		let totalWorkspaces = 0;
		let paidWorkspaces = 0;

		for (const stat of workspaceStats) {
			totalWorkspaces += stat.count;
			const plan = WORKSPACE_PLANS.get(stat.plan);
			if (plan && stat.plan !== 'free') {
				paidWorkspaces += stat.count;
				mrr += plan.price.monthly.amount * 100 * stat.count;
			}
		}

		return {
			totalUsers: userCount,
			totalWorkspaces,
			paidWorkspaces,
			mrr,
			totalFans: fanCount,
			totalRevenue: revenueResult.totalRevenue,
			totalOrders: revenueResult.orderCount,
			planDistribution: workspaceStats.map(s => ({
				plan: s.plan,
				count: s.count,
			})),
		};
	}),

	userGrowth: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
		const conditions = [];
		if (input.startDate) {
			conditions.push(gte(Users.createdAt, new Date(input.startDate)));
		}
		if (input.endDate) {
			conditions.push(lte(Users.createdAt, new Date(input.endDate)));
		}

		const result = await dbHttp
			.select({
				date: sql<string>`DATE(${Users.createdAt})`.as('date'),
				count: count(),
			})
			.from(Users)
			.where(sqlAnd(conditions))
			.groupBy(sql`DATE(${Users.createdAt})`)
			.orderBy(sql`DATE(${Users.createdAt})`);

		return result;
	}),

	workspacesByPlan: adminProcedure.query(async () => {
		const result = await dbHttp
			.select({
				plan: Workspaces.plan,
				count: count(),
			})
			.from(Workspaces)
			.where(ne(Workspaces.type, 'personal'))
			.groupBy(Workspaces.plan);

		return result;
	}),

	topWorkspaces: adminProcedure
		.input(
			z.object({
				sortBy: z.enum(['fans', 'events', 'revenue']).default('events'),
				limit: z.number().default(10),
			}),
		)
		.query(async ({ input }) => {
			if (input.sortBy === 'revenue') {
				const result = await dbHttp
					.select({
						workspaceId: Carts.workspaceId,
						workspaceName: Workspaces.name,
						workspaceHandle: Workspaces.handle,
						plan: Workspaces.plan,
						totalRevenue: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.mapWith(
							Number,
						),
						orderCount: count(),
					})
					.from(Carts)
					.innerJoin(Workspaces, eq(Carts.workspaceId, Workspaces.id))
					.where(isNotNull(Carts.checkoutConvertedAt))
					.groupBy(Carts.workspaceId, Workspaces.name, Workspaces.handle, Workspaces.plan)
					.orderBy(
						desc(sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.mapWith(Number)),
					)
					.limit(input.limit);

				return result.map(r => ({
					id: r.workspaceId,
					name: r.workspaceName,
					handle: r.workspaceHandle,
					plan: r.plan,
					value: r.totalRevenue,
					orderCount: r.orderCount,
				}));
			}

			// Sort by fans or events (use workspace counters)
			const sortColumn =
				input.sortBy === 'fans' ? Workspaces.fanUsage : Workspaces.eventUsage;

			const result = await dbHttp
				.select({
					id: Workspaces.id,
					name: Workspaces.name,
					handle: Workspaces.handle,
					plan: Workspaces.plan,
					value: sortColumn,
				})
				.from(Workspaces)
				.where(ne(Workspaces.type, 'personal'))
				.orderBy(desc(sortColumn))
				.limit(input.limit);

			return result;
		}),

	recentUsers: adminProcedure.input(paginationInput).query(async ({ input }) => {
		const searchCondition =
			input.search ?
				or(
					sqlStringContains(Users.email, input.search),
					sqlStringContains(Users.fullName, input.search),
				)
			:	undefined;

		const [users, totalResult] = await Promise.all([
			dbHttp
				.select({
					id: Users.id,
					email: Users.email,
					fullName: Users.fullName,
					firstName: Users.firstName,
					lastName: Users.lastName,
					createdAt: Users.createdAt,
					admin: Users.admin,
				})
				.from(Users)
				.where(searchCondition)
				.orderBy(desc(Users.createdAt))
				.limit(input.limit)
				.offset(input.cursor),

			dbHttp
				.select({ count: sqlCount })
				.from(Users)
				.where(searchCondition)
				.then(r => r[0]?.count ?? 0),
		]);

		// Get workspace counts for each user
		const userIds = users.map(u => u.id);
		const workspaceCounts =
			userIds.length > 0 ?
				await dbHttp
					.select({
						userId: _Users_To_Workspaces.userId,
						count: count(),
					})
					.from(_Users_To_Workspaces)
					.where(inArray(_Users_To_Workspaces.userId, userIds))
					.groupBy(_Users_To_Workspaces.userId)
			:	[];

		const workspaceCountMap = new Map(workspaceCounts.map(wc => [wc.userId, wc.count]));

		return {
			users: users.map(u => ({
				...u,
				workspaceCount: workspaceCountMap.get(u.id) ?? 0,
			})),
			total: totalResult,
			nextCursor:
				input.cursor + input.limit < totalResult ? input.cursor + input.limit : null,
		};
	}),

	recentWorkspaces: adminProcedure
		.input(
			paginationInput.extend({
				planFilter: z.enum(WORKSPACE_PLAN_TYPES).optional(),
				sortBy: z
					.enum(['createdAt', 'fanUsage', 'eventUsage', 'linkUsage', 'orders'])
					.default('createdAt'),
				sortOrder: z.enum(['asc', 'desc']).default('desc'),
			}),
		)
		.query(async ({ input }) => {
			const conditions = [ne(Workspaces.type, 'personal')];

			if (input.search) {
				conditions.push(
					or(
						sqlStringContains(Workspaces.name, input.search),
						sqlStringContains(Workspaces.handle, input.search),
					) ?? sql`1=1`,
				);
			}

			if (input.planFilter) {
				conditions.push(eq(Workspaces.plan, input.planFilter));
			}

			const whereClause = sqlAnd(conditions);

			const sortColumnMap = {
				createdAt: Workspaces.createdAt,
				fanUsage: Workspaces.fanUsage,
				eventUsage: Workspaces.eventUsage,
				linkUsage: Workspaces.linkUsage,
				orders: Workspaces.orders,
			} as const;

			const sortColumn = sortColumnMap[input.sortBy];
			const orderFn = input.sortOrder === 'asc' ? asc : desc;

			const [workspaces, totalResult] = await Promise.all([
				dbHttp
					.select({
						id: Workspaces.id,
						name: Workspaces.name,
						handle: Workspaces.handle,
						plan: Workspaces.plan,
						type: Workspaces.type,
						fanUsage: Workspaces.fanUsage,
						eventUsage: Workspaces.eventUsage,
						linkUsage: Workspaces.linkUsage,
						emailUsage: Workspaces.emailUsage,
						orders: Workspaces.orders,
						balance: Workspaces.balance,
						createdAt: Workspaces.createdAt,
					})
					.from(Workspaces)
					.where(whereClause)
					.orderBy(orderFn(sortColumn))
					.limit(input.limit)
					.offset(input.cursor),

				dbHttp
					.select({ count: sqlCount })
					.from(Workspaces)
					.where(whereClause)
					.then(r => r[0]?.count ?? 0),
			]);

			return {
				workspaces,
				total: totalResult,
				nextCursor:
					input.cursor + input.limit < totalResult ? input.cursor + input.limit : null,
			};
		}),

	revenueTimeseries: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
		const conditions = [isNotNull(Carts.checkoutConvertedAt)];

		if (input.startDate) {
			conditions.push(gte(Carts.checkoutConvertedAt, new Date(input.startDate)));
		}
		if (input.endDate) {
			conditions.push(lte(Carts.checkoutConvertedAt, new Date(input.endDate)));
		}

		const result = await dbHttp
			.select({
				date: sql<string>`DATE(${Carts.checkoutConvertedAt})`.as('date'),
				revenue: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.mapWith(Number),
				orders: count(),
			})
			.from(Carts)
			.where(sqlAnd(conditions))
			.groupBy(sql`DATE(${Carts.checkoutConvertedAt})`)
			.orderBy(sql`DATE(${Carts.checkoutConvertedAt})`);

		return result;
	}),
} satisfies TRPCRouterRecord;
