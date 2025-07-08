import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { z } from 'zod/v4';

import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);

type Resend_GetDomain = Awaited<ReturnType<typeof resend.domains.get>>;
export type Resend_DomainRecord = NonNullable<Resend_GetDomain['data']>['records'][0];

export type SendEmailProps = {
	from: string;
	fromFriendlyName?: string;
	to: string | string[];
	subject: string;

	replyTo?: string;
	bcc?: string | string[];
	cc?: string | string[];
	react: ReactElement;
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
	const safeParsedFrom = z.email().safeParse(props.from);

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
		replyTo: props.replyTo,
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

export type SendEmailBatchProps = SendEmailProps & {
	emailDeliveryId: string;
	fanId: string;
};

export async function sendEmailBatch(emails: SendEmailBatchProps[]) {
	const formattedEmails = emails.map(email => {
		const safeParsedFrom = z.email().safeParse(email.from);

		const from =
			email.fromFriendlyName && safeParsedFrom.success ?
				`${email.fromFriendlyName} <${email.from}>`
			:	email.from;

		return {
			...email,
			from,
			headers:
				email.type === 'marketing' ?
					{
						'List-Unsubscribe': `<${email.listUnsubscribeUrl}>`,
						'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
					}
				:	undefined,
		};
	});

	const res = await resend.batch.send(formattedEmails);

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

	// we want to map the resend ids to the original email props
	return {
		emails: emails.map((email, index) => ({
			...email,
			resendId: res.data?.data[index]?.id,
		})),
	};
}
