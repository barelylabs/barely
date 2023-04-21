import { render as reactEmailRender, render } from '@react-email/render';
import * as Postmark from 'postmark';

import env from '~/env';

const postmark = new Postmark.ServerClient(env.POSTMARK_SERVER_API_TOKEN);

interface SendEmailProps {
	to: string;
	from: string;
	subject: string;

	template: JSX.Element;

	text?: string;
	html?: string;
	type: 'transactional' | 'marketing';
}

const sendEmail = async (props: SendEmailProps) => {
	const { to, from, subject, template, type } = props;

	const text = render(template, {
		plainText: true,
	});

	const html = render(template, {
		pretty: true,
	});

	try {
		const postmarkResponse = await postmark.sendEmail({
			To: to,
			From: from,
			Subject: subject,
			TextBody: text,
			HtmlBody: html,
			MessageStream: type === 'transactional' ? 'outbound' : 'broadcast',
		});

		console.log('postmarkResponse => ', postmarkResponse);
		return postmarkResponse;
	} catch (error) {
		console.error(error);
	}
};

const renderEmail = (Email: JSX.Element) => {
	return reactEmailRender(Email);
};

export { sendEmail, renderEmail };
