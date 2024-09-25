// import type { SQL } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { and, eq, gte, isNotNull, isNull, lte, ne, or, sql, sum } from 'drizzle-orm';

import type { FanGroupCondition } from './fan-group.schema';
import { Carts } from '../cart/cart.sql';

// import { Fans } from '../fan/fan.sql';

export function generateFanGroupConditions(conditions: FanGroupCondition[]) {
	const whereConditions: SQL[] = [];
	const havingConditions: SQL[] = [];

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
				const cond =
					condition.exclude ?
						// 	sql`(SELECT ${sum(Carts.orderAmount)} > ${condition.totalOrderAmount} from ${Carts})`
						// :	sql`(SELECT ${sum(Carts.orderAmount)} < ${condition.totalOrderAmount} from ${Carts})`;
						sql`(SELECT (${lte(sum(Carts.orderAmount), condition.totalOrderAmount)}) from ${Carts})`
					:	sql`(SELECT (${gte(sum(Carts.orderAmount), condition.totalOrderAmount)}) from ${Carts})`;
				// :	gte(sum(Carts.orderAmount), condition.totalOrderAmount);

				if (cond === undefined) return;

				return whereConditions.push(cond);
			}

			default:
				return undefined;
			// return sql`1=1`; // Default to true if condition type is not recognized
		}
	});

	// const filteredSqlConditions = sqlConditions.filter(c => c !== undefined);
	// console.log('filteredSqlConditions', filteredSqlConditions);

	// return filteredSqlConditions;
	return {
		whereConditions,
		havingConditions,
	};
	// return filteredSqlConditions.length ? or(...filteredSqlConditions) : undefined;
	// return [...sqlConditions, ...finalConditions];
}
