// import type { SQL } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { and, asc, eq, isNotNull, or, sql } from 'drizzle-orm';

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
						condition.exclude ?
							sql`carts.has_purchased_cart_funnel = FALSE OR carts.cart_count = 0`
						:	sql`carts.has_purchased_cart_funnel = TRUE and carts.cart_count > 0`,
					);

				return whereConditions.push(
					condition.exclude ?
						sql`(${condition.cartFunnelId} != ALL(carts.purchased_cart_funnel_ids) OR carts.purchased_cart_funnel_ids IS NULL)`
					:	sql`${condition.cartFunnelId} = ANY(carts.purchased_cart_funnel_ids)`,
				);

			case 'hasOrderedProduct':
				if (!condition.productId)
					return whereConditions.push(
						condition.exclude ?
							sql`carts.has_purchased_main_product = FALSE or carts.has_purchased_main_product IS NULL`
						:	sql`carts.has_purchased_main_product = TRUE`,
					); // this is the same as hasOrderedCart

				return whereConditions.push(
					condition.exclude ?
						sql`COALESCE(
                            NOT (
                                COALESCE(${condition.productId} = ANY(carts.purchased_main_product_ids), FALSE) OR 
                                COALESCE(${condition.productId} = ANY(carts.purchased_bump_product_ids), FALSE) OR 
                                COALESCE(${condition.productId} = ANY(carts.purchased_upsell_product_ids), FALSE)
                            ),
                            TRUE
						)`
					:	sql`(${condition.productId} = ANY(carts.purchased_main_product_ids) OR
                            ${condition.productId} = ANY(carts.purchased_bump_product_ids) OR
                            ${condition.productId} = ANY(carts.purchased_upsell_product_ids))`,
				);

			case 'hasOrderedAmount': {
				const cond =
					condition.exclude ?
						sql`carts.order_amount <= ${condition.totalOrderAmount}`
					:	sql`carts.order_amount >= ${condition.totalOrderAmount}`;
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
}

export function generateFanGroupWhere(conditions: FanGroupCondition[]) {
	const { whereConditions: includeWhereConditions } = generateFanGroupConditions(
		conditions.filter(condition => condition.exclude === false),
	);

	const { whereConditions: excludeWhereConditions } = generateFanGroupConditions(
		conditions.filter(condition => condition.exclude === true),
	);

	return sqlAnd([
		// emailMarketingOptInOnly ? eq(emailMarketingOptIn, true) : undefined,
		includeWhereConditions.length ? or(...includeWhereConditions) : undefined,
		excludeWhereConditions.length ? and(...excludeWhereConditions) : undefined,
	]);
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
			// id: Carts.id,
			fanId: Carts.fanId,
			orderAmount: sql<number>`COALESCE(SUM(${Carts.orderAmount}), 0)`.as('order_amount'),
			cartCount: sql<number>`COUNT(${Carts.id})`.as('cart_count'),

			// Use boolean aggregates for conditions we need to filter by
			hasPurchasedCartFunnel: sql<boolean>`bool_or(${Carts.cartFunnelId} IS NOT NULL)`.as(
				'has_purchased_cart_funnel',
			),
			hasPurchasedMainProduct:
				sql<boolean>`bool_or(${Carts.mainProductId} IS NOT NULL)`.as(
					'has_purchased_main_product',
				),
			hasPurchasedBumpProduct:
				sql<boolean>`bool_or(${Carts.bumpProductId} IS NOT NULL AND ${Carts.addedBump} = true)`.as(
					'has_purchased_bump_product',
				),
			hasPurchasedUpsellProduct:
				sql<boolean>`bool_or(${Carts.upsellProductId} IS NOT NULL AND ${Carts.upsellConvertedAt} IS NOT NULL)`.as(
					'has_purchased_upsell_product',
				),
			// Store arrays of IDs for specific filtering
			purchasedCartFunnelIds: sql<string[]>`array_agg(DISTINCT ${Carts.cartFunnelId})`.as(
				'purchased_cart_funnel_ids',
			),
			purchasedMainProductIds: sql<
				string[]
			>`array_agg(DISTINCT ${Carts.mainProductId})`.as('purchased_main_product_ids'),
			purchasedBumpProductIds: sql<
				string[]
			>`array_agg(DISTINCT CASE WHEN ${Carts.addedBump} = true THEN ${Carts.bumpProductId} END)`.as(
				'purchased_bump_product_ids',
			),
			purchasedUpsellProductIds: sql<
				string[]
			>`array_agg(DISTINCT CASE WHEN ${Carts.upsellConvertedAt} IS NOT NULL THEN ${Carts.upsellProductId} END)`.as(
				'purchased_upsell_product_ids',
			),
			// purchasedProductIds: sql<string[]>`
			// 	array_agg(DISTINCT p.product_id)
			// `.as('purchased_product_ids'),
		})
		.from(Carts)
		// .leftJoin(
		// 	sql`
		// 		(SELECT UNNEST(ARRAY[
		// 			${Carts.mainProductId},
		// 			CASE WHEN ${Carts.addedBump} = true THEN ${Carts.bumpProductId} END,
		// 			CASE WHEN ${Carts.upsellConvertedAt} IS NOT NULL THEN ${Carts.upsellProductId} END
		// 		]) as product_id) p
		// 	`,
		// 	sql`true`,
		// )
		.where(isNotNull(Carts.checkoutConvertedAt))
		.groupBy(Carts.fanId)
		.as('carts');

export async function getFanGroupCount(
	fanGroup: FanGroupWithConditions,
	dbPool: Db['pool'],
) {
	const fansSubquery = getFansWithIdSubquery(fanGroup.workspaceId, dbPool);
	const cartSubquery = getCartsSubquery(dbPool);

	const countQuery = dbPool
		.select({
			count: sqlCount,
		})
		.from(fansSubquery)
		.leftJoin(cartSubquery, eq(fansSubquery.fanId, cartSubquery.fanId))
		.where(generateFanGroupWhere(fanGroup.conditions));

	const countRes = await countQuery;

	const count = countRes[0]?.count ?? 0;

	console.log(`count for ${fanGroup.name}`, count);

	return count;
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
	// const { whereConditions: includeWhereConditions } = generateFanGroupConditions(
	// 	fanGroup.conditions.filter(condition => !condition.exclude),
	// );

	// const { whereConditions: excludeWhereConditions } = generateFanGroupConditions(
	// 	fanGroup.conditions.filter(condition => condition.exclude),
	// );

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
		// .leftJoin(Carts, eq(fansSubquery.fanId, Carts.fanId))
		.where(
			sqlAnd([
				marketingOptInOnly ? eq(fansSubquery.emailMarketingOptIn, true) : undefined,
				generateFanGroupWhere(fanGroup.conditions),
			]),
		);

	const fansRes = await fansQuery;

	return fansRes;
}
