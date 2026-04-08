const SHOPIFY_API_VERSION = '2025-04';

interface ShopifyGraphQLResponse<T> {
	data: T;
	errors?: {
		message: string;
		locations?: { line: number; column: number }[];
		path?: string[];
		extensions?: {
			code: string;
			cost?: {
				requestedQueryCost: number;
				actualQueryCost: number;
				throttleStatus: {
					maximumAvailable: number;
					currentlyAvailable: number;
					restoreRate: number;
				};
			};
		};
	}[];
	extensions?: {
		cost?: {
			requestedQueryCost: number;
			actualQueryCost: number;
			throttleStatus: {
				maximumAvailable: number;
				currentlyAvailable: number;
				restoreRate: number;
			};
		};
	};
}

export class ShopifyClient {
	private shopDomain: string;
	private accessToken: string;
	private apiVersion: string;

	constructor(shopDomain: string, accessToken: string) {
		this.shopDomain = shopDomain;
		this.accessToken = accessToken;
		this.apiVersion = SHOPIFY_API_VERSION;
	}

	async query<T>(
		query: string,
		variables?: Record<string, unknown>,
	): Promise<ShopifyGraphQLResponse<T>> {
		const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Shopify-Access-Token': this.accessToken,
			},
			body: JSON.stringify({ query, variables }),
		});

		if (response.status === 429) {
			// Rate limited - wait and retry once
			const retryAfter = response.headers.get('Retry-After');
			const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
			await new Promise(resolve => setTimeout(resolve, waitMs));

			const retryResponse = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Shopify-Access-Token': this.accessToken,
				},
				body: JSON.stringify({ query, variables }),
			});

			if (!retryResponse.ok) {
				throw new Error(
					`Shopify API error after retry: ${retryResponse.status} ${retryResponse.statusText}`,
				);
			}

			return (await retryResponse.json()) as ShopifyGraphQLResponse<T>;
		}

		if (!response.ok) {
			throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
		}

		const result = (await response.json()) as ShopifyGraphQLResponse<T>;

		if (result.errors?.length) {
			const errorMessages = result.errors.map(e => e.message).join(', ');
			throw new Error(`Shopify GraphQL errors: ${errorMessages}`);
		}

		return result;
	}
}
