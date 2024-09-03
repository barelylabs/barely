import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

type Resend_GetDomain = Awaited<ReturnType<typeof resend.domains.get>>;
export type Resend_DomainRecord = NonNullable<Resend_GetDomain['data']>['records'][0];

interface SendEmailProps {
	from: string;
	to: string | string[];
	subject: string;
	type: 'transactional' | 'marketing';
	replyTo?: string;
	bcc?: string | string[];
	cc?: string | string[];
	react: JSX.Element;
	text?: string;
	html?: string;
}

export async function sendEmail(props: SendEmailProps) {
	const res = await resend.emails.send({
		from: props.from,
		to: props.to,
		subject: props.subject,
		html: props.html,
		react: props.react,
		cc: props.cc,
		bcc: props.bcc,
		reply_to: props.replyTo,
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
