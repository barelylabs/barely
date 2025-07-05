import { libEnv } from '../../env';

const accountSid = libEnv.TWILIO_ACCOUNT_SID;
const authToken = libEnv.TWILIO_AUTH_TOKEN;

async function sendText({ to, from, body }: { to: string; body: string; from?: string }) {
	if (!accountSid || !authToken) return console.error('Twilio credentials not found');

	// send sms using twilio rest api

	const message = (await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString(
					'base64',
				)}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				From: from ?? libEnv.TWILIO_PHONE_NUMBER,
				To: to,
				Body: body,
			}).toString(),
		},
	).then(res => res.json())) as unknown;

	console.log('sms message response => ', message);

	return true;
}

export { sendText };
