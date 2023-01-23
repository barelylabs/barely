import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function send(to: string, body: string, from?: string) {
	if (!accountSid || !authToken) return console.error('Twilio credentials not found');

	const client = new Twilio(accountSid, authToken);

	const message = await client.messages.create({
		body,
		from: from ?? process.env.TWILIO_PHONE_NUMBER,
		to,
	});

	return message;
}
