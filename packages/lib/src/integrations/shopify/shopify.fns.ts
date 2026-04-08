import 'server-only';

import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { and, eq } from 'drizzle-orm';

import { libEnv } from '../../../env';
import { ShopifyClient } from './shopify.client';

/**
 * Get the Shopify provider account for a workspace.
 * Returns null if no Shopify account is connected.
 */
export async function getShopifyAccount(workspaceId: string) {
	const account = await dbHttp.query.ProviderAccounts.findFirst({
		where: and(
			eq(ProviderAccounts.provider, 'shopify'),
			eq(ProviderAccounts.workspaceId, workspaceId),
		),
	});

	return account ?? null;
}

/**
 * Get the Shopify access token for a workspace, refreshing if expired.
 * Returns the access token and shop domain, or null if not connected.
 */
export async function getShopifyAccessToken(workspaceId: string) {
	const account = await getShopifyAccount(workspaceId);
	if (!account) return null;

	const { access_token, refresh_token, expires_at, server: shopDomain } = account;

	if (!access_token || !shopDomain) return null;

	// Check if token needs refresh (Shopify expiring tokens have refresh_token)
	if (refresh_token && expires_at && expires_at < Date.now() / 1000) {
		const refreshed = await refreshShopifyAccessToken(shopDomain, refresh_token);

		if (refreshed) {
			await dbHttp
				.update(ProviderAccounts)
				.set({
					access_token: refreshed.access_token,
					expires_at: Math.floor(Date.now() / 1000 + refreshed.expires_in),
				})
				.where(eq(ProviderAccounts.id, account.id));

			return { accessToken: refreshed.access_token, shopDomain };
		}

		return null;
	}

	return { accessToken: access_token, shopDomain };
}

/**
 * Create a ShopifyClient for a workspace.
 * Returns null if no Shopify account is connected.
 */
export async function getShopifyClient(workspaceId: string) {
	const credentials = await getShopifyAccessToken(workspaceId);
	if (!credentials) return null;

	return new ShopifyClient(credentials.shopDomain, credentials.accessToken);
}

/**
 * Refresh an expired Shopify access token using the refresh token.
 */
async function refreshShopifyAccessToken(shopDomain: string, refreshToken: string) {
	try {
		const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_id: libEnv.SHOPIFY_CLIENT_ID,
				client_secret: libEnv.SHOPIFY_CLIENT_SECRET,
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}),
		});

		if (!response.ok) {
			console.error('Failed to refresh Shopify access token:', await response.text());
			return null;
		}

		const data = (await response.json()) as {
			access_token: string;
			expires_in: number;
			refresh_token?: string;
		};

		return data;
	} catch (error) {
		console.error('Error refreshing Shopify access token:', error);
		return null;
	}
}
