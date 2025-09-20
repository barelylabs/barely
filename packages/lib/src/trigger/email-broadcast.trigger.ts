import type { NeonPool } from '@barely/db/pool';
import type { SendEmailBatchProps } from '@barely/email';
import type {
	EmailBroadcast,
	EmailTemplateWithFrom,
	FanForEmail,
} from '@barely/validators';
import { dbPool, makePool } from '@barely/db/pool';
import { EmailBroadcasts, EmailDeliveries, Workspaces } from '@barely/db/sql';
import { Fans } from '@barely/db/sql/fan.sql';
import { sqlAnd, sqlIncrement } from '@barely/db/utils';
import { sendEmailBatch } from '@barely/email';
import {
	getAbsoluteUrl,
	getEmailAddressFromEmailAddress,
	isDevelopment,
	newId,
	parseFullName,
	wait as waitUtil,
} from '@barely/utils';
import { task, wait } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';

import { getFanGroupFansForEmail } from '../functions/fan-group.fns';
import { getAssetsFromMdx } from '../functions/mdx.fns.js';
import { renderMarkdownToReactEmail } from '../mdx/email-template.mdx';

let pool: NeonPool | null = null;

const getPool = () => {
	if (pool) return pool;
	return (pool = makePool());
};

const cleanUpDbPool = async () => {
	if (pool) {
		await pool.end();
	}
	pool = null;
};

interface HandleEmailBroadcastPayload {
	id: string;
}

export const handleEmailBroadcast = task({
	id: 'handle-email-broadcast',
	run: async ({ id }: HandleEmailBroadcastPayload, { ctx }) => {
		const triggerRunId = ctx.run.id;

		const db = dbPool(getPool());

		// get email broadcast
		const emailBroadcast = await db.query.EmailBroadcasts.findFirst({
			where: eq(EmailBroadcasts.id, id),
			with: {
				emailTemplate: {
					with: {
						from: {
							with: {
								domain: true,
							},
						},
					},
				},
				fanGroup: {
					with: {
						conditions: true,
					},
				},
			},
		});

		if (!emailBroadcast) {
			throw new Error('Email broadcast not found');
		}

		const { emailTemplate, fanGroup } = emailBroadcast;

		if (emailBroadcast.scheduledAt && emailBroadcast.scheduledAt > new Date()) {
			await db
				.update(EmailBroadcasts)
				.set({ status: 'scheduled', triggerRunId })
				.where(eq(EmailBroadcasts.id, id));

			await cleanUpDbPool();
			await wait.until({ date: emailBroadcast.scheduledAt });

			await db
				.update(EmailBroadcasts)
				.set({ status: 'sending' })
				.where(eq(EmailBroadcasts.id, id));
		}

		if (emailBroadcast.fanGroupId && !fanGroup) {
			// a fanGroupId was provided but no matching fan group was found
			console.error('Fan group not found');
			await db
				.update(EmailBroadcasts)
				.set({ status: 'failed', error: 'Fan group not found', triggerRunId })
				.where(eq(EmailBroadcasts.id, id));
			throw new Error('Fan group not found');
		}

		const fans: FanForEmail[] = [];

		if (fanGroup) {
			const fanGroupFans = await getFanGroupFansForEmail(fanGroup, getPool(), {
				marketingOptInOnly: emailTemplate.type === 'marketing',
			});
			console.log('pushing fan group fans to fans array', fanGroupFans);

			// just in case, we should filter out duplicates
			const uniqueFanGroupFans = fanGroupFans.filter(
				(fan, index, self) => index === self.findIndex(t => t.id === fan.id),
			);

			fans.push(...uniqueFanGroupFans);
		} else {
			const allFans = await db.query.Fans.findMany({
				columns: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					fullName: true,
				},
				where: sqlAnd([
					eq(Fans.workspaceId, emailBroadcast.workspaceId),
					emailTemplate.type === 'marketing' ?
						eq(Fans.emailMarketingOptIn, true)
					:	undefined,
				]),
			});
			console.log('pushing all fans to fans array', fans);
			fans.push(...allFans);
		}

		console.log('fans', fans);
		// update email broadcast status to sending

		await db
			.update(EmailBroadcasts)
			.set({ status: 'sending', triggerRunId })
			.where(eq(EmailBroadcasts.id, id));

		// in batches of 100, send email to fans
		for (let i = 0; i < fans.length; i += 100) {
			const fanBatch = fans.slice(i, i + 100);

			await handleSendEmailBatch({
				emailBroadcast,
				emailTemplate,
				fans: fanBatch,
				pool: getPool(),
			});

			// increment workspace email usage (this could also wait until after all batches are sent)
			await db
				.update(Workspaces)
				.set({
					emailUsage: sqlIncrement(Workspaces.emailUsage, fanBatch.length),
				})
				.where(eq(Workspaces.id, emailBroadcast.workspaceId));

			await waitUtil(500); // the resend api rate limit is 2 requests per second
		}

		// update email broadcast status to 'sent'
		await db
			.update(EmailBroadcasts)
			.set({ status: 'sent', sentAt: new Date() })
			.where(eq(EmailBroadcasts.id, id));
	},
});

async function getEmailDataForBatch({
	emailBroadcast,
	emailTemplate,
	fan,
}: {
	emailBroadcast: EmailBroadcast;
	emailTemplate: EmailTemplateWithFrom;
	fan: FanForEmail;
	pool: NeonPool;
}) {
	const { firstName, lastName } = parseFullName(fan.fullName);

	const assets = await getAssetsFromMdx(emailTemplate.body);

	const emailDeliveryId = newId('emailDelivery');

	const listUnsubscribeUrl = getAbsoluteUrl(
		'manageEmail',
		`unsubscribe/${emailDeliveryId}`,
	);

	const { subject, reactBody } = await renderMarkdownToReactEmail({
		subject: emailTemplate.subject,
		previewText: emailTemplate.previewText,
		body: emailTemplate.body,
		variables: {
			firstName,
			lastName,
		},

		assets,

		tracking: {
			emailBroadcastId: emailBroadcast.id,
			emailTemplateId: emailTemplate.id,
			fanId: fan.id,
		},

		listUnsubscribeUrl:
			emailTemplate.type === 'marketing' ? listUnsubscribeUrl : undefined,
	});

	const toEmail =
		isDevelopment() ? `adam+broadcast-${fan.email.split('@')[0]}@barely.ai` : fan.email;

	return {
		emailDeliveryId,
		fanId: fan.id,
		to: toEmail,
		from: getEmailAddressFromEmailAddress(emailTemplate.from),
		fromFriendlyName: emailTemplate.from.defaultFriendlyName ?? undefined,
		replyTo: emailTemplate.from.replyTo ?? undefined,
		subject,
		react: reactBody,
		...(emailTemplate.type === 'transactional' ?
			{ type: 'transactional' }
		:	{
				type: 'marketing',
				listUnsubscribeUrl,
			}),
	} satisfies SendEmailBatchProps;
}

async function handleSendEmailBatch({
	emailBroadcast,
	emailTemplate,
	fans,
	pool,
}: {
	emailTemplate: EmailTemplateWithFrom;
	fans: FanForEmail[];
	emailBroadcast: EmailBroadcast;
	pool: NeonPool;
}) {
	const emails = await Promise.all(
		fans.map(fan =>
			getEmailDataForBatch({
				emailBroadcast,
				emailTemplate,
				fan,
				pool,
			}),
		),
	);

	const res = await sendEmailBatch(emails);

	console.log('res', res);

	if (res.error) {
		console.error(res.error);
		throw new Error('Error sending email batch');
	}

	if (!res.emails) {
		throw new Error('No emails returned from Resend');
	}

	// create email deliveries
	await dbPool(pool)
		.insert(EmailDeliveries)
		.values(
			res.emails.map(email => ({
				id: email.emailDeliveryId,
				resendId: email.resendId,
				workspaceId: emailBroadcast.workspaceId,
				emailTemplateId: emailTemplate.id,
				fanId: email.fanId,
				status: 'sent' as const,
				sentAt: new Date(),
				emailBroadcastId: emailBroadcast.id,
			})),
		);
}
