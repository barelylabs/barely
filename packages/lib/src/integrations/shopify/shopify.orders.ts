import type { ShopifyClient } from './shopify.client';

interface ShopifyLineItemInput {
	variantId: string;
	quantity: number;
	priceSet: {
		shopMoney: {
			amount: string;
			currencyCode: string;
		};
	};
}

interface ShopifyOrderInput {
	lineItems: ShopifyLineItemInput[];
	customer: {
		email: string;
		firstName?: string;
		lastName?: string;
	};
	shippingAddress?: {
		firstName?: string;
		lastName?: string;
		address1?: string;
		address2?: string;
		city?: string;
		province?: string;
		country?: string;
		zip?: string;
	};
	currency: string;
	note?: string;
	tags?: string[];
}

interface OrderCreateResult {
	orderCreate: {
		order: {
			id: string;
			name: string;
			displayFinancialStatus: string;
		} | null;
		userErrors: {
			field: string[] | null;
			message: string;
		}[];
	};
}

const ORDER_CREATE_MUTATION = `
	mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
		orderCreate(order: $order, options: $options) {
			order {
				id
				name
				displayFinancialStatus
			}
			userErrors {
				field
				message
			}
		}
	}
`;

/**
 * Create an order in a Shopify store via the Admin API.
 * The order is created as PAID with inventory decremented.
 */
export async function createShopifyOrder(
	client: ShopifyClient,
	input: ShopifyOrderInput,
) {
	const totalAmount = input.lineItems.reduce(
		(sum, item) => sum + parseFloat(item.priceSet.shopMoney.amount) * item.quantity,
		0,
	);

	const variables = {
		order: {
			currency: input.currency.toUpperCase(),
			financialStatus: 'PAID',
			lineItems: input.lineItems.map(item => ({
				variantId: item.variantId,
				quantity: item.quantity,
				priceSet: item.priceSet,
			})),
			customer: {
				toUpsert: {
					email: input.customer.email,
					firstName: input.customer.firstName,
					lastName: input.customer.lastName,
				},
			},
			...(input.shippingAddress ?
				{
					shippingAddress: {
						firstName: input.shippingAddress.firstName,
						lastName: input.shippingAddress.lastName,
						address1: input.shippingAddress.address1,
						address2: input.shippingAddress.address2,
						city: input.shippingAddress.city,
						provinceCode: input.shippingAddress.province,
						countryCode: input.shippingAddress.country,
						zip: input.shippingAddress.zip,
					},
				}
			:	{}),
			transactions: [
				{
					kind: 'SALE',
					status: 'SUCCESS',
					amountSet: {
						shopMoney: {
							amount: totalAmount.toFixed(2),
							currencyCode: input.currency.toUpperCase(),
						},
					},
				},
			],
			note: input.note,
			tags: input.tags,
		},
		options: {
			inventoryBehaviour: 'DECREMENT_OBEYING_POLICY',
		},
	};

	const result = await client.query<OrderCreateResult>(ORDER_CREATE_MUTATION, variables);

	const orderCreate = result.data.orderCreate;

	if (orderCreate.userErrors.length > 0) {
		const errorMessages = orderCreate.userErrors
			.map(e => `${e.field?.join('.') ?? 'unknown'}: ${e.message}`)
			.join('; ');
		throw new Error(`Shopify orderCreate errors: ${errorMessages}`);
	}

	if (!orderCreate.order) {
		throw new Error('Shopify orderCreate returned no order');
	}

	return {
		shopifyOrderId: orderCreate.order.id,
		shopifyOrderNumber: orderCreate.order.name,
		financialStatus: orderCreate.order.displayFinancialStatus,
	};
}
