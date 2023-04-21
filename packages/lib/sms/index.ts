import { Twilio } from 'twilio';

import env from '../env';

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;

async function sendText({ to, from, body }: { to: string; body: string; from?: string }) {
	if (!accountSid || !authToken) return console.error('Twilio credentials not found');

	const client = new Twilio(accountSid, authToken);

	const message = await client.messages.create({
		from: from ?? process.env.TWILIO_PHONE_NUMBER,
		to,
		body,
	});

	return message;
}

export { sendText };
