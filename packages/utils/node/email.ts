import { render as reactEmailRender } from '@react-email/render';
import env from '../env';

import * as Postmark from 'postmark';
const postmark = new Postmark.ServerClient(env.POSTMARK_SERVER_API_TOKEN);

interface SendEmailProps {
	to: string;
	from: string;
	subject: string;
	text: string;
	type: 'transactional' | 'marketing';
	html: string;
}

export async function send(props: SendEmailProps) {
	const { to, from, subject, text, html, type } = props;

	try {
		const postmarkResponse = await postmark.sendEmail({
			To: to,
			From: from,
			Subject: subject,
			TextBody: text,
			HtmlBody: html,
		});

		console.log('postmarkResponse => ', postmarkResponse);
		return postmarkResponse;
	} catch (error) {
		console.error(error);
	}
}

export async function render(Email: JSX.Element) {
	return reactEmailRender(Email);
}
