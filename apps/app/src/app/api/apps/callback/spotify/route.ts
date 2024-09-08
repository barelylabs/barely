import { auth } from '@barely/lib/server/auth';
import { dbHttp } from '@barely/lib/server/db';
import { providerStateSchema } from '@barely/lib/server/routes/provider-account/provider-account.schema';
import { ProviderAccounts } from '@barely/lib/server/routes/provider-account/provider-account.sql';
import { newId } from '@barely/lib/utils/id';
import { raise } from '@barely/lib/utils/raise';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { z } from 'zod';

export const GET = auth(async req => {
	const params = req.nextUrl.searchParams;
	const code = params.get('code') ?? raise('code is required');
	// const state = params.get('state') ?? raise('state is required');

	console.log('code', code);

	const base64EncodedState = params.get('state') ?? raise('state is required');
	const base64DecodedState = Buffer.from(base64EncodedState, 'base64').toString('utf-8');
	console.log('base64DecodedState', base64DecodedState);
	const state = providerStateSchema.parse(JSON.parse(base64DecodedState));
	console.log('state', state);

	const userId = req.auth?.user.id;
	if (!userId) {
		return new Response('user not found', { status: 404 });
	}

	const workspace = req.auth?.user.workspaces.find(
		workspace => workspace.id === state.workspaceId,
	);

	if (!workspace) {
		return new Response('workspace not found', { status: 404 });
	}

	const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: getAbsoluteUrl('app', 'api/apps/callback/spotify'),
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
});

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
	email: z.string().email(),
	images: z.array(z.object({ url: z.string() })),
});
