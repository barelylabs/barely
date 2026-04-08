import type { ShopifyClient } from './shopify.client';

export interface ShopifyProductVariant {
	id: string;
	title: string;
	sku: string | null;
	price: string;
	inventoryQuantity: number | null;
	image: { url: string } | null;
}

export interface ShopifyProduct {
	id: string;
	title: string;
	status: string;
	images: { nodes: Array<{ url: string }> };
	variants: { nodes: ShopifyProductVariant[] };
}

interface ProductsQueryResult {
	products: {
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string | null;
		};
		nodes: ShopifyProduct[];
	};
}

const PRODUCTS_QUERY = `
	query Products($first: Int!, $after: String) {
		products(first: $first, after: $after) {
			pageInfo {
				hasNextPage
				endCursor
			}
			nodes {
				id
				title
				status
				images(first: 1) {
					nodes {
						url
					}
				}
				variants(first: 50) {
					nodes {
						id
						title
						sku
						price
						inventoryQuantity
						image {
							url
						}
					}
				}
			}
		}
	}
`;

/**
 * List products from a Shopify store with pagination.
 */
export async function listShopifyProducts(
	client: ShopifyClient,
	cursor?: string,
	pageSize = 25,
) {
	const result = await client.query<ProductsQueryResult>(PRODUCTS_QUERY, {
		first: pageSize,
		after: cursor ?? null,
	});

	return {
		products: result.data.products.nodes,
		pageInfo: result.data.products.pageInfo,
	};
}
