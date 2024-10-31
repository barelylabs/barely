import type { SendEmailBatchProps } from '@barely/email';
import { sendEmailBatch } from '@barely/email';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { task, wait } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import type { DbPool } from '../server/db/pool';
import type { EmailBroadcast } from '../server/routes/email-broadcast/email-broadcast-schema';
import type { EmailTemplateWithFrom } from '../server/routes/email-template/email-template.schema';
import type { FanForEmail } from '../server/routes/fan/fan.schema';
import { env } from '../env';
import { dbSchema } from '../server/db';
import { getAssetsFromMdx } from '../server/mdx/mdx.fns';
import { EmailBroadcasts } from '../server/routes/email-broadcast/email-broadcast.sql';
import { EmailDeliveries } from '../server/routes/email-delivery/email-delivery.sql';
import { renderMarkdownToReactEmail } from '../server/routes/email-template/email-template.mdx';
import { getFanGroupFansForEmail } from '../server/routes/fan-group/fan-group.fns';
import { Fans } from '../server/routes/fan/fan.sql';
import { Workspaces } from '../server/routes/workspace/workspace.sql';
import { getEmailAddressFromEmailAddress } from '../utils/email';
import { isDevelopment } from '../utils/environment';
import { newId } from '../utils/id';
import { parseFullName } from '../utils/name';
import { sqlAnd, sqlIncrement } from '../utils/sql';
import { getAbsoluteUrl } from '../utils/url';
import { wait as waitUtil } from '../utils/wait';

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbPool: DbPool | null = null;

const getPool = () => {
	if (!pool) {
		pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
	}
	return pool;
};

const getDbPool = () => {
	if (!dbPool) {
		dbPool = drizzle(getPool(), { schema: dbSchema });
	}
	return dbPool;
};

const cleanUpDbPool = async () => {
	if (pool) {
		await pool.end();
	}
	pool = null;
	dbPool = null;
};

interface HandleEmailBroadcastPayload {
	id: string;
}

export const handleEmailBroadcast = task({
	id: 'handle-email-broadcast',
	run: async ({ id }: HandleEmailBroadcastPayload, { ctx }) => {
		const triggerRunId = ctx.run.id;

		// get email broadcast
		const emailBroadcast = await getDbPool().query.EmailBroadcasts.findFirst({
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
			await getDbPool()
				.update(EmailBroadcasts)
				.set({ status: 'scheduled', triggerRunId })
				.where(eq(EmailBroadcasts.id, id));

			await cleanUpDbPool();
			await wait.until({ date: emailBroadcast.scheduledAt });

			await getDbPool()
				.update(EmailBroadcasts)
				.set({ status: 'sending' })
				.where(eq(EmailBroadcasts.id, id));
		}

		if (emailBroadcast.fanGroupId && !fanGroup) {
			// a fanGroupId was provided but no matching fan group was found
			console.error('Fan group not found');
			await getDbPool()
				.update(EmailBroadcasts)
				.set({ status: 'failed', error: 'Fan group not found', triggerRunId })
				.where(eq(EmailBroadcasts.id, id));
			throw new Error('Fan group not found');
		}

		const fans: FanForEmail[] = [];

		if (fanGroup) {
			const fanGroupFans = await getFanGroupFansForEmail(fanGroup, getDbPool(), {
				marketingOptInOnly: emailTemplate.type === 'marketing',
			});
			console.log('pushing fan group fans to fans array', fanGroupFans);
			fans.push(...(fanGroupFans ?? []));
		} else {
			const allFans = await getDbPool().query.Fans.findMany({
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

		await getDbPool()
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
			});

			// increment workspace email usage (this could also wait until after all batches are sent)
			await getDbPool()
				.update(Workspaces)
				.set({
					emailUsage: sqlIncrement(Workspaces.emailUsage, fanBatch.length),
				})
				.where(eq(Workspaces.id, emailBroadcast.workspaceId));

			await waitUtil(500); // the resend api rate limit is 2 requests per second
		}

		// update email broadcast status to 'sent'
		await getDbPool()
			.update(EmailBroadcasts)
			.set({ status: 'sent', sentAt: new Date() })
			.where(eq(EmailBroadcasts.id, id));
	},
});

async function getEmailDataForBatch({
	emailTemplate,
	fan,
}: {
	emailTemplate: EmailTemplateWithFrom;
	fan: FanForEmail;
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
		body: emailTemplate.body,
		variables: {
			firstName,
			lastName,
		},
		// tracking
		emailTemplateId: emailTemplate.id,
		fanId: fan.id,
		// assets
		...assets,
	});

	const toEmail =
		isDevelopment() ? `adam+broadcast-${fan.email.split('@')[0]}@barely.io` : fan.email;

	return {
		emailDeliveryId,
		fanId: fan.id,
		to: toEmail,
		bcc: 'adam+broadcast-monitoring@barely.io', // fixme: remove once we're happy with this
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
}: {
	emailTemplate: EmailTemplateWithFrom;
	fans: FanForEmail[];
	emailBroadcast: EmailBroadcast;
}) {
	const emails = await Promise.all(
		fans.map(fan =>
			getEmailDataForBatch({
				emailTemplate,
				fan,
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
	await getDbPool()
		.insert(EmailDeliveries)
		.values(
			res.emails.map(email => ({
				id: email.emailDeliveryId,
				workspaceId: emailBroadcast.workspaceId,
				emailTemplateId: emailTemplate.id,
				fanId: email.fanId,
				status: 'sent' as const,
				sentAt: new Date(),
				emailBroadcastId: emailBroadcast.id,
			})),
		);
}
