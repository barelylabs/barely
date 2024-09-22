import type { NextRequest } from 'next/server';
import { handleEmailEvent } from '@barely/lib/server/routes/email-delivery/email-delivery.event-fns';
import { Webhook } from 'svix';

import { env } from '~/env';

const secret = env.RESEND_WEBHOOK_SECRET;

const wh = new Webhook(secret);

export async function POST(req: NextRequest) {
	const body = await req.text();
	// const payload = req.body;
	// const headers = req.headers;
	const svixId = req.headers.get('svix-id');
	const svixTimestamp = req.headers.get('svix-timestamp');
	const svixSignature = req.headers.get('svix-signature');

	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response('No svix headers', { status: 400 });
	}

	if (!body) {
		return new Response('No payload or headers', { status: 400 });
	}

	const payload = wh.verify(body, {
		'svix-id': svixId,
		'svix-timestamp': svixTimestamp,
		'svix-signature': svixSignature,
	});

	return await handleEmailEvent(payload);
}
