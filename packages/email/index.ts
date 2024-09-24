import { Resend } from 'resend';
import { z } from 'zod';

import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);

type Resend_GetDomain = Awaited<ReturnType<typeof resend.domains.get>>;
export type Resend_DomainRecord = NonNullable<Resend_GetDomain['data']>['records'][0];

type SendEmailProps = {
	from: string;
	fromFriendlyName?: string;
	to: string | string[];
	subject: string;

	replyTo?: string;
	bcc?: string | string[];
	cc?: string | string[];
	react: JSX.Element;
	text?: string;
	html?: string;
} & (
	| {
			type: 'transactional';
			listUnsubscribeUrl?: string;
	  }
	| {
			type: 'marketing';
			listUnsubscribeUrl: string;
	  }
);

export async function sendEmail(props: SendEmailProps) {
	const safeParsedFrom = z.string().email().safeParse(props.from);

	const from =
		props.fromFriendlyName && safeParsedFrom.success ?
			`${props.fromFriendlyName} <${props.from}>`
		:	props.from;

	const res = await resend.emails.send({
		from,
		to: props.to,
		subject: props.subject,
		html: props.html,
		react: props.react,
		cc: props.cc,
		bcc: props.bcc,
		reply_to: props.replyTo,
		headers:
			props.type === 'marketing' ?
				{
					'List-Unsubscribe': `<${props.listUnsubscribeUrl}>`,
					'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
				}
			:	undefined,
	});

	if (res.error) {
		console.error(res.error);
		return {
			error: res.error,
		};
	}

	if (!res.data) {
		return {
			error: 'No data returned from Resend',
		};
	}

	return {
		resendId: res.data.id,
	};
}

// export async function sendEmail(props: SendEmailProps) {
// 	try {
// 		const html = await renderAsync(props.react);
// 		const text = await renderAsync(props.react, { plainText: true });

// 		const res = await fetch('https://api.resend.com/emails', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				Authorization: `Bearer ${process.env.RESEND_API_KEY!}`,
// 			},
// 			body: JSON.stringify({
// 				from: props.from,
// 				to: props.to,
// 				subject: props.subject,
// 				html,
// 				text,
// 			}),
// 		});
// 		if (res.ok) return true;
// 	} catch (err) {
// 		console.error(err);
// 	}
// }
