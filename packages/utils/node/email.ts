import env from '@barely/env';

import { render as reactEmailRender } from '@react-email/render';

const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(env.SENDGRID_API_KEY);

interface SendEmailProps {
	to: string;
	from: string;
	subject: string;
	text: string;
	type: 'transactional' | 'marketing';
	html: string;
}

export async function send(props: SendEmailProps) {
	const options = {
		to: props.to,
		from: props.from,
		subject: props.subject,
		text: props.text,
		html: props.html,
	};

	try {
		await sendgrid.send(options);
	} catch (error) {
		console.error(error);
	}
}

export async function render(Email: JSX.Element) {
	return reactEmailRender(Email);
}
