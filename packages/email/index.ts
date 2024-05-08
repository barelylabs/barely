// import { renderAsync } from '@react-email/render';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
	from: string;
	to: string | string[];
	subject: string;
	type: 'transactional' | 'marketing';
	bcc?: string | string[];
	cc?: string | string[];
	reply_to?: string;
	react: JSX.Element;
	text?: string;
	html?: string;
}

export async function sendEmail(props: SendEmailProps) {
	const { error } = await resend.emails.send({
		from: props.from,
		to: props.to,
		subject: props.subject,
		html: props.html,
		// text: props.text,
		react: props.react,
		bcc: props.bcc,
		cc: props.cc,
		reply_to: props.reply_to,
	});

	if (error) {
		console.error(error);
		return false;
	}
	return true;
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
