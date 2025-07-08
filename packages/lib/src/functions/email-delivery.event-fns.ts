import type { EmailDeliveryStatus } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import {
	EmailBroadcasts,
	EmailDeliveries,
	EmailTemplates,
	FlowActions,
	FlowRunActions,
} from '@barely/db/sql';
import { sqlIncrement } from '@barely/db/utils';
import { ingestEmailEvent } from '@barely/tb/ingest';
import { wait } from '@barely/utils';
import { emailEventSchema } from '@barely/validators/schemas';
import { and, eq } from 'drizzle-orm';

export async function handleEmailEvent(payload: unknown) {
	const event = emailEventSchema.safeParse(payload);

	if (!event.success) {
		return new Response('Invalid event', { status: 400 });
	}

	const { type, data } = event.data;

	await wait(10000); // hacky, but trying to make sure we've added the email delivery to our db at the point of receiving the event from Resend

	const { email_id: resendId, from, to: toArray, subject } = data;

	const commonIngestData = {
		timestamp: new Date().toISOString(),
		from,
		to: toArray.join(','),
		subject,
		clickDestinationAssetId: null,
		clickDestinationHref: null,
		resendId,
		// fixme - we gotta get these for real, or ease the types.
		workspaceId: '123',
		assetId: '123',
		href: 'email',
		sessionId: '123',
	};

	switch (type) {
		case 'email.bounced': {
			const emailDelivery = await updateEmailDelivery({
				resendId,
				status: 'bounced',
			});

			if (emailDelivery) {
				const { fanId, emailBroadcastId, emailTemplateId, flowRunActionId } =
					emailDelivery;

				const { flowId, flowActionId } = await getFlowAction(flowRunActionId);

				await ingestEmailEvent({
					...commonIngestData,
					type: 'bounced',
					fanId,
					emailTemplateId,
					flowId,
					flowActionId,
					emailBroadcastId,
				});
			}

			return new Response('Email bounced', { status: 200 });
		}
		case 'email.delivered': {
			const emailDelivery = await updateEmailDelivery({
				resendId,
				status: 'delivered',
			});

			if (emailDelivery) {
				const { flowRunActionId, emailBroadcastId, emailTemplateId, fanId } =
					emailDelivery;

				const { flowId, flowActionId } = await getFlowAction(flowRunActionId);

				await ingestEmailEvent({
					...commonIngestData,
					type: 'delivered',
					emailBroadcastId,
					emailTemplateId,
					fanId,
					flowId,
					flowActionId,
				});

				// fixme deprecate these once tb is used for stats
				if (flowId && flowActionId)
					await incrementFlowAction({ flowId, flowActionId, type: 'deliveries' });
				if (emailBroadcastId)
					await incrementEmailBroadcast({ emailBroadcastId, type: 'deliveries' });
				if (emailTemplateId)
					await incrementEmailTemplate({ emailTemplateId, type: 'deliveries' });
			}

			return new Response('Email delivered', { status: 200 });
		}
		case 'email.opened': {
			const emailDelivery = await updateEmailDelivery({
				resendId,
				status: 'opened',
			});

			if (emailDelivery) {
				const { flowRunActionId, emailBroadcastId, emailTemplateId, fanId } =
					emailDelivery;

				const { flowId, flowActionId } = await getFlowAction(flowRunActionId);
				await ingestEmailEvent({
					...commonIngestData,
					type: 'opened',
					emailBroadcastId,
					emailTemplateId,
					fanId,
					flowId,
					flowActionId,
				});

				// fixme deprecate these once tb is used for stats
				if (flowId && flowActionId)
					await incrementFlowAction({ flowId, flowActionId, type: 'opens' });
				if (emailBroadcastId)
					await incrementEmailBroadcast({ emailBroadcastId, type: 'opens' });
			}

			return new Response('Email opened', { status: 200 });
		}
		case 'email.clicked': {
			const emailDelivery = await updateEmailDelivery({
				resendId,
				status: 'clicked',
			});

			if (emailDelivery) {
				const { flowRunActionId, emailBroadcastId, emailTemplateId, fanId } =
					emailDelivery;

				const { flowId, flowActionId } = await getFlowAction(flowRunActionId);

				await ingestEmailEvent({
					...commonIngestData,
					type: 'clicked',
					emailBroadcastId,
					emailTemplateId,
					fanId,
					flowId,
					flowActionId,
				});

				// fixme deprecate these once tb is used for stats
				if (flowId && flowActionId)
					await incrementFlowAction({ flowId, flowActionId, type: 'clicks' });
				if (emailBroadcastId)
					await incrementEmailBroadcast({ emailBroadcastId, type: 'clicks' });
				if (emailTemplateId)
					await incrementEmailTemplate({ emailTemplateId, type: 'clicks' });
			}

			return new Response('Email clicked', { status: 200 });
		}
		case 'email.complained': {
			const emailDelivery = await updateEmailDelivery({
				resendId,
				status: 'complained',
			});

			if (emailDelivery) {
				const { flowRunActionId, emailBroadcastId, emailTemplateId, fanId } =
					emailDelivery;

				const { flowId, flowActionId } = await getFlowAction(flowRunActionId);

				await ingestEmailEvent({
					...commonIngestData,
					type: 'complained',
					emailBroadcastId,
					emailTemplateId,
					fanId,
					flowId,
					flowActionId,
				});
			}

			// await dbHttp
			// 	.update(EmailDeliveries)
			// 	.set({
			// 		status: 'complained',
			// 		complainedAt: new Date(),
			// 	})
			// 	.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email complained', { status: 200 });
		}
	}
}

async function updateEmailDelivery({
	resendId,
	status,
}: {
	resendId: string;
	status: EmailDeliveryStatus;
}) {
	const [emailDelivery] = await dbHttp
		.update(EmailDeliveries)
		.set({
			status,
			deliveredAt: new Date(),
		})
		.where(eq(EmailDeliveries.resendId, resendId))
		.returning({
			emailTemplateId: EmailDeliveries.emailTemplateId,
			flowRunActionId: EmailDeliveries.flowRunActionId,
			emailBroadcastId: EmailDeliveries.emailBroadcastId,
			fanId: EmailDeliveries.fanId,
		});

	return emailDelivery;
}

async function getFlowAction(flowRunActionId: string | null) {
	if (!flowRunActionId) return { flowId: null, flowActionId: null };

	const flowRunAction = await dbHttp.query.FlowRunActions.findFirst({
		where: eq(FlowRunActions.id, flowRunActionId),
		columns: {
			flowId: true,
			flowActionId: true,
		},
	});

	return flowRunAction ?
			{ flowId: flowRunAction.flowId, flowActionId: flowRunAction.flowActionId }
		:	{ flowId: null, flowActionId: null };
}

async function incrementFlowAction({
	flowId,
	flowActionId,
	type,
}: {
	flowId: string;
	flowActionId: string;
	type: 'deliveries' | 'opens' | 'clicks';
}) {
	await dbHttp
		.update(FlowActions)
		.set({
			[type]: sqlIncrement(FlowActions[type]),
		})
		.where(and(eq(FlowActions.flowId, flowId), eq(FlowActions.id, flowActionId)));
}

async function incrementEmailBroadcast({
	emailBroadcastId,
	type,
}: {
	emailBroadcastId: string;
	type: 'deliveries' | 'opens' | 'clicks';
}) {
	await dbHttp
		.update(EmailBroadcasts)
		.set({
			[type]: sqlIncrement(EmailBroadcasts[type]),
		})
		.where(eq(EmailBroadcasts.id, emailBroadcastId));
}

async function incrementEmailTemplate({
	emailTemplateId,
	type,
}: {
	emailTemplateId: string;
	type: 'deliveries' | 'opens' | 'clicks';
}) {
	await dbHttp
		.update(EmailTemplates)
		.set({
			[type]: sqlIncrement(EmailTemplates[type]),
		})
		.where(eq(EmailTemplates.id, emailTemplateId));
}
