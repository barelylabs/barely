import type { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { getUserWorkspacesById } from '@barely/lib/functions/workspace.fns';
import { getAbsoluteUrl, getCurrentAppVariant, newId, raise } from '@barely/utils';
import { providerStateSchema } from '@barely/validators';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { auth } from '~/auth/server';
import { appEnv } from '~/env';

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return redirect('/login');
	}

	const params = req.nextUrl.searchParams;

	// Verify HMAC signature from Shopify (required by Shopify OAuth spec)
	const hmac = params.get('hmac');
	if (!hmac) {
		return new Response('Missing HMAC parameter', { status: 400 });
	}

	const allParams = Object.fromEntries(params.entries());
	delete allParams.hmac;
	const sortedMessage = Object.keys(allParams)
		.sort()
		.map(key => `${key}=${allParams[key]}`)
		.join('&');
	const generatedHmac = createHmac('sha256', appEnv.SHOPIFY_CLIENT_SECRET)
		.update(sortedMessage)
		.digest('hex');
	const hashesMatch =
		hmac.length === generatedHmac.length &&
		timingSafeEqual(Buffer.from(hmac, 'utf-8'), Buffer.from(generatedHmac, 'utf-8'));
	if (!hashesMatch) {
		return new Response('HMAC verification failed', { status: 403 });
	}

	const code = params.get('code') ?? raise('code is required');
	const base64EncodedState = params.get('state') ?? raise('state is required');
	const base64DecodedState = Buffer.from(base64EncodedState, 'base64').toString('utf-8');
	const state = providerStateSchema.parse(JSON.parse(base64DecodedState));

	const shopDomain = state.shopDomain ?? raise('shopDomain is required in state');

	// Validate that the shop param from Shopify matches the expected shop domain
	const shopParam = params.get('shop');
	if (shopParam && shopParam !== shopDomain) {
		return new Response('Shop domain mismatch', { status: 403 });
	}

	const userId = session.user.id;
	if (!userId) {
		return new Response('user not found', { status: 404 });
	}

	const { workspaces } = await getUserWorkspacesById(userId);
	const workspace = workspaces.find(w => w.id === state.workspaceId);

	if (!workspace) {
		return new Response('workspace not found', { status: 404 });
	}

	// Exchange authorization code for access token
	const tokenRes = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id: appEnv.SHOPIFY_CLIENT_ID,
			client_secret: appEnv.SHOPIFY_CLIENT_SECRET,
			code,
		}),
	});

	if (!tokenRes.ok) {
		const errorText = await tokenRes.text();
		console.error('Shopify token exchange failed:', errorText);
		return new Response('Failed to exchange Shopify authorization code', { status: 500 });
	}

	const token = shopifyTokenSchema.parse(await tokenRes.json());

	// Fetch shop metadata
	const shopRes = await fetch(`https://${shopDomain}/admin/api/2025-04/shop.json`, {
		headers: {
			'X-Shopify-Access-Token': token.access_token,
		},
	});

	if (!shopRes.ok) {
		console.error('Failed to fetch Shopify shop info');
		return new Response('Failed to fetch Shopify shop info', { status: 500 });
	}

	const shopData = shopifyShopSchema.parse(await shopRes.json());
	const shop = shopData.shop;

	// Upsert the provider account (update if already connected, insert if new)
	const existing = await dbHttp.query.ProviderAccounts.findFirst({
		where: and(
			eq(ProviderAccounts.provider, 'shopify'),
			eq(ProviderAccounts.workspaceId, workspace.id),
		),
	});

	if (existing) {
		await dbHttp
			.update(ProviderAccounts)
			.set({
				access_token: token.access_token,
				scope: token.scope,
				providerAccountId: String(shop.id),
				username: shop.name,
				server: shopDomain,
			})
			.where(eq(ProviderAccounts.id, existing.id));
	} else {
		await dbHttp.insert(ProviderAccounts).values({
			provider: 'shopify',
			id: newId('providerAccount'),
			userId,
			workspaceId: workspace.id,
			type: 'oauth',
			access_token: token.access_token,
			scope: token.scope,
			providerAccountId: String(shop.id),
			username: shop.name,
			server: shopDomain,
		});
	}

	return Response.redirect(state.redirectUrl);
}

const shopifyTokenSchema = z.object({
	access_token: z.string(),
	scope: z.string(),
});

const shopifyShopSchema = z.object({
	shop: z.object({
		id: z.number(),
		name: z.string(),
		email: z.string().optional(),
		domain: z.string().optional(),
		myshopify_domain: z.string().optional(),
	}),
});
