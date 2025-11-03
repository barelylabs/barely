import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { getAbsoluteUrl, getCurrentAppVariant, newId, raise } from '@barely/utils';
import { providerStateSchema } from '@barely/validators';
import { z } from 'zod/v4';

import { auth } from '~/auth/server';
import { appEnv } from '~/env';

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return redirect('/login');
	}

	const params = req.nextUrl.searchParams;
	const code = params.get('code') ?? raise('code is required');

	console.log('code', code);

	const base64EncodedState = params.get('state') ?? raise('state is required');
	const base64DecodedState = Buffer.from(base64EncodedState, 'base64').toString('utf-8');
	console.log('base64DecodedState', base64DecodedState);
	const state = providerStateSchema.parse(JSON.parse(base64DecodedState));
	console.log('state', state);

	const userId = session.userId;
	if (!userId) {
		return new Response('user not found', { status: 404 });
	}

	const workspace = session.workspaces.find(
		workspace => workspace.id === state.workspaceId,
	);

	if (!workspace) {
		return new Response('workspace not found', { status: 404 });
	}

	const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${appEnv.SPOTIFY_CLIENT_ID}:${appEnv.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: getAbsoluteUrl(getCurrentAppVariant(), 'api/apps/callback/spotify'),
		}),
	});

	const token = spotifyTokenSchema.parse(await tokenRes.json());
	console.log('token', token);

	// get user information
	const userRes = await fetch('https://api.spotify.com/v1/me', {
		headers: {
			Authorization: `Bearer ${token.access_token}`,
		},
	});
	const user = spotifyUserSchema.parse(await userRes.json());
	console.log('user', user);

	await dbHttp.insert(ProviderAccounts).values({
		provider: 'spotify',
		id: newId('providerAccount'),
		userId,
		workspaceId: workspace.id,
		type: 'oauth',

		access_token: token.access_token,
		refresh_token: token.refresh_token,
		expires_at: Math.floor(Date.now() / 1000 + token.expires_in), //
		scope: token.scope,

		providerAccountId: user.id,
		username: user.display_name,
		email: user.email,
		image: user.images[0]?.url,
	});

	return Response.redirect(state.redirectUrl);
}

const spotifyTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.literal('Bearer'),
	scope: z.string(),
	expires_in: z.number().int(),
	refresh_token: z.string(),
});

const spotifyUserSchema = z.object({
	id: z.string(),
	display_name: z.string(),
	email: z.email(),
	images: z.array(z.object({ url: z.string() })),
});
