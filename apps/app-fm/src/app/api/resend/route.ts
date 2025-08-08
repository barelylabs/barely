import type { NextRequest } from 'next/server';
import { handleEmailEvent } from '@barely/lib/functions/email-delivery.event-fns';
import { log } from '@barely/lib/utils/log';
import { Webhook } from 'svix';

import { appEnv } from '~/env';

const secret = appEnv.RESEND_WEBHOOK_SECRET;

const wh = new Webhook(secret);

export async function POST(req: NextRequest) {
	const body = await req.text();
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

	await handleEmailEvent(payload).catch(async e => {
		await log({
			message: `Error handling email event: ${e}`,
			type: 'errors',
			location: 'api/resend',
		});

		return new Response('Error handling email event', { status: 500 });
	});

	return new Response('Email event handled', { status: 200 });
}
