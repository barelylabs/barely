// import type { SQL } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { and, asc, eq, isNotNull, isNull, ne, or, sql } from 'drizzle-orm';

import type { Db } from '../../db';
import type { FanGroupCondition, FanGroupWithConditions } from './fan-group.schema';
import { sqlAnd, sqlCount } from '../../../utils/sql';
import { Carts } from '../cart/cart.sql';
import { Fans } from '../fan/fan.sql';
import { FanGroupConditions, FanGroups } from './fan-group.sql';

export function generateFanGroupConditions(conditions: FanGroupCondition[]) {
	const whereConditions: SQL[] = [];

	conditions.map(condition => {
		switch (condition.type) {
			case 'hasOrderedCart':
				if (!condition.cartFunnelId)
					return whereConditions.push(
						condition.exclude ? isNull(Carts.id) : isNotNull(Carts.id),
					);

				return whereConditions.push(
					condition.exclude ?
						ne(Carts.cartFunnelId, condition.cartFunnelId)
					:	eq(Carts.cartFunnelId, condition.cartFunnelId),
				);

			case 'hasOrderedProduct':
				if (!condition.productId)
					return whereConditions.push(
						condition.exclude ? isNull(Carts.id) : isNotNull(Carts.id),
					); // this is the same as hasOrderedCart

				if (!condition.exclude) {
					const cond = or(
						eq(Carts.mainProductId, condition.productId),
						and(eq(Carts.bumpProductId, condition.productId), eq(Carts.addedBump, true)),
						and(
							eq(Carts.upsellProductId, condition.productId),
							isNotNull(Carts.upsellConvertedAt),
						),
					);

					if (cond === undefined) return;

					return whereConditions.push(cond);
				} else {
					const cond = and(
						ne(Carts.mainProductId, condition.productId),
						or(eq(Carts.addedBump, false), ne(Carts.bumpProductId, condition.productId)),
						or(
							isNull(Carts.upsellConvertedAt),
							ne(Carts.upsellProductId, condition.productId),
						),
					);

					if (cond === undefined) return;

					return whereConditions.push(cond);
				}

			case 'hasOrderedAmount': {
				// we need to check if the aggregate amount of all orders is greater than the amount
				// return sql`${Carts.orderAmount} ${condition.operator} ${condition.totalOrderAmount}`;
				// return undefined;

				console.log('hasOrderedAmount condition', condition);
				// const cond =
				// 	condition.exclude ?
				// 		// 	sql`(SELECT ${sum(Carts.orderAmount)} > ${condition.totalOrderAmount} from ${Carts})`
				// 		// :	sql`(SELECT ${sum(Carts.orderAmount)} < ${condition.totalOrderAmount} from ${Carts})`;
				// 		sql`(SELECT (${lte(sum(Carts.orderAmount), condition.totalOrderAmount)}) from ${Carts})`
				// 	:	sql`(SELECT (${gte(sum(Carts.orderAmount), condition.totalOrderAmount)}) from ${Carts})`;
				// :	gte(sum(Carts.orderAmount), condition.totalOrderAmount);

				// const cond = condition.exclude ?
				// sql`(SELECT ${sum(Carts.orderAmount)} > ${condition.totalOrderAmount} from ${Carts})`lte

				// return;
				const cond =
					condition.exclude ?
						sql`carts.orderamount <= ${condition.totalOrderAmount}`
					:	sql`carts.orderamount >= ${condition.totalOrderAmount}`;
				if (cond === undefined) return;

				return whereConditions.push(cond);
			}

			default:
				return undefined;
		}
	});

	return {
		whereConditions,
	};
	// return [...sqlConditions, ...finalConditions];
}

export async function getFanGroupById(id: string, dbPool: Db['pool']) {
	const fanGroup = await dbPool.query.FanGroups.findFirst({
		where: eq(FanGroups.id, id),
		with: {
			conditions: {
				orderBy: asc(FanGroupConditions.createdAt),
			},
		},
	});

	if (!fanGroup) return null;
	return fanGroup;
}

const getFansWithIdSubquery = (workspaceId: string, dbPool: Db['pool']) =>
	dbPool
		.select({
			fanId: Fans.id,
		})
		.from(Fans)
		.where(eq(Fans.workspaceId, workspaceId))
		.as('fans');

const getFansForEmailSubquery = (workspaceId: string, dbPool: Db['pool']) =>
	dbPool
		.select({
			fanId: Fans.id,
			email: Fans.email,
			firstName: Fans.firstName,
			lastName: Fans.lastName,
			fullName: Fans.fullName,
			emailMarketingOptIn: Fans.emailMarketingOptIn,
		})
		.from(Fans)
		.where(eq(Fans.workspaceId, workspaceId))
		.as('fans');

const getCartsSubquery = (dbPool: Db['pool']) =>
	dbPool
		.select({
			fanId: Carts.fanId,
			orderAmount: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.as('orderamount'),
			cartCount: sql<number>`COUNT(${Carts.id})`.as('cartCount'),
		})
		.from(Carts)
		.where(isNotNull(Carts.checkoutConvertedAt))
		.groupBy(Carts.fanId)
		.as('carts');

export async function getFanGroupCount(
	fanGroup: FanGroupWithConditions,
	dbPool: Db['pool'],
) {
	const { whereConditions: includeWhereConditions } = generateFanGroupConditions(
		fanGroup.conditions.filter(condition => !condition.exclude),
	);

	const { whereConditions: excludeWhereConditions } = generateFanGroupConditions(
		fanGroup.conditions.filter(condition => condition.exclude),
	);

	const fansSubquery = getFansWithIdSubquery(fanGroup.workspaceId, dbPool);
	// const fanSubquery = dbPool
	// 	.select({
	// 		fanId: Fans.id,
	// 	})
	// 	.from(Fans)
	// 	.where(eq(Fans.workspaceId, fanGroup.workspaceId))
	// 	.as('fans');

	const cartSubquery = getCartsSubquery(dbPool);
	// 		orderAmount: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.as('orderamount'),
	// 		cartCount: sql<number>`COUNT(${Carts.id})`.as('cartCount'),
	// 	})
	// 	.from(Carts)
	// 	.where(isNotNull(Carts.checkoutConvertedAt))
	// 	.groupBy(Carts.fanId)
	// 	.as('carts');

	const countQuery = dbPool
		.select({
			count: sqlCount,
		})
		.from(fansSubquery)
		.leftJoin(cartSubquery, eq(fansSubquery.fanId, cartSubquery.fanId))
		.leftJoin(Carts, eq(fansSubquery.fanId, Carts.fanId))
		.where(
			sqlAnd([
				includeWhereConditions.length ? or(...includeWhereConditions) : undefined,
				excludeWhereConditions.length ? or(...excludeWhereConditions) : undefined,
			]),
		);

	const countRes = await countQuery;

	return countRes[0]?.count ?? 0;
}

export async function getFanGroupFansForEmail(
	fanGroup: FanGroupWithConditions,
	dbPool: Db['pool'],
	{
		marketingOptInOnly = false,
	}: {
		marketingOptInOnly?: boolean;
	} = {},
) {
	const { whereConditions: includeWhereConditions } = generateFanGroupConditions(
		fanGroup.conditions.filter(condition => !condition.exclude),
	);

	const { whereConditions: excludeWhereConditions } = generateFanGroupConditions(
		fanGroup.conditions.filter(condition => condition.exclude),
	);

	const fansSubquery = getFansForEmailSubquery(fanGroup.workspaceId, dbPool);
	const cartSubquery = getCartsSubquery(dbPool);

	const fansQuery = dbPool
		.select({
			id: fansSubquery.fanId,
			email: fansSubquery.email,
			firstName: fansSubquery.firstName,
			lastName: fansSubquery.lastName,
			fullName: fansSubquery.fullName,
			// emailMarketingOptIn: fansSubquery.emailMarketingOptIn,
		})
		.from(fansSubquery)
		.leftJoin(cartSubquery, eq(fansSubquery.fanId, cartSubquery.fanId))
		.leftJoin(Carts, eq(fansSubquery.fanId, Carts.fanId))
		.where(
			sqlAnd([
				marketingOptInOnly ? eq(fansSubquery.emailMarketingOptIn, true) : undefined,
				includeWhereConditions.length ? or(...includeWhereConditions) : undefined,
				excludeWhereConditions.length ? or(...excludeWhereConditions) : undefined,
			]),
		);

	const fansRes = await fansQuery;

	return fansRes;
}
