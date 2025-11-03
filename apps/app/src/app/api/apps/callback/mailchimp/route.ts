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

	const code = params.get('code');
	console.log('code => ', code);
	if (!code) {
		return new Response('No code found', { status: 400 });
	}

	const base64EncodedState = params.get('state') ?? raise('no state');
	const decodedState = Buffer.from(base64EncodedState, 'base64').toString('utf-8');
	const state = providerStateSchema.parse(JSON.parse(decodedState));
	console.log('state ', state);

	const userId = session.userId;
	if (!userId) {
		return new Response('user not found', { status: 400 });
	}

	const workspace = session.workspaces.find(w => w.id === state.workspaceId);

	if (!workspace) {
		return new Response('workspace not found', { status: 400 });
	}

	const tokenRes = await fetch('https://login.mailchimp.com/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: appEnv.MAILCHIMP_CLIENT_ID,
			client_secret: appEnv.MAILCHIMP_CLIENT_SECRET,
			redirect_uri: getAbsoluteUrl(getCurrentAppVariant(), 'api/apps/callback/mailchimp'),
			code,
		}),
	}).catch(err => {
		console.error('err => ', err);
		return new Response(null, {
			statusText: 'Internal Server Error',
			status: 500,
		});
	});

	const tokens = mailchimpTokenSetSchema.parse(await tokenRes.json());

	const metadataRes = await fetch('https://login.mailchimp.com/oauth2/metadata', {
		headers: {
			Authorization: `OAuth ${tokens.access_token}`,
		},
	});

	const metadata = mailchimpMetadataSchema.parse(await metadataRes.json());

	await dbHttp.insert(ProviderAccounts).values({
		provider: 'mailchimp',
		id: newId('providerAccount'),
		userId,
		workspaceId: workspace.id,
		type: 'oauth',

		server: metadata.dc,
		access_token: tokens.access_token,
		scope: tokens.scope,

		providerAccountId: metadata.user_id,
		username: metadata.accountname,
		email: metadata.login.email,
		image: metadata.login.avatar,
	});

	return Response.redirect(state.redirectUrl);
}

const mailchimpTokenSetSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
	scope: z.string().nullable(),
});

const mailchimpMetadataSchema = z.object({
	dc: z.string(),
	user_id: z.coerce.string(),
	accountname: z.string(),
	login: z.object({
		email: z.string(),
		login_name: z.string(),
		avatar: z.string().nullable(),
	}),
});
