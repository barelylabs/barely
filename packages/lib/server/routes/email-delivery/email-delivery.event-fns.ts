import { and, eq } from 'drizzle-orm';

import { sqlIncrement } from '../../../utils/sql';
import { wait } from '../../../utils/wait';
import { dbHttp } from '../../db';
import { EmailBroadcasts } from '../email-broadcast/email-broadcast.sql';
import { FlowActions, FlowRunActions } from '../flow/flow.sql';
import { emailEventSchema } from './email-delivery.schema';
import { EmailDeliveries } from './email-delivery.sql';

export async function handleEmailEvent(payload: unknown) {
	const event = emailEventSchema.safeParse(payload);

	if (!event.success) {
		return new Response('Invalid event', { status: 400 });
	}

	const { type, data } = event.data;

	await wait(10000); // hacky, but trying to make sure we've added the email delivery to our db at the point of receiving the event from Resend

	switch (type) {
		case 'email.bounced': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					status: 'bounced',
					bouncedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email bounced', { status: 200 });
		}
		case 'email.delivered': {
			const { email_id } = data;

			const [emailDelivery] = await dbHttp
				.update(EmailDeliveries)
				.set({
					status: 'delivered',
					deliveredAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id))
				.returning({
					flowRunActionId: EmailDeliveries.flowRunActionId,
					emailBroadcastId: EmailDeliveries.emailBroadcastId,
				});

			if (emailDelivery?.flowRunActionId) {
				const flowRunAction = await dbHttp.query.FlowRunActions.findFirst({
					where: eq(FlowRunActions.id, emailDelivery.flowRunActionId),
					columns: {
						flowId: true,
						flowActionId: true,
					},
				});

				if (flowRunAction) {
					await dbHttp
						.update(FlowActions)
						.set({
							deliveries: sqlIncrement(FlowActions.deliveries),
						})
						.where(
							and(
								eq(FlowActions.flowId, flowRunAction.flowId),
								eq(FlowActions.id, flowRunAction.flowActionId),
							),
						);
				}
			}
			if (emailDelivery?.emailBroadcastId) {
				await dbHttp
					.update(EmailBroadcasts)
					.set({
						deliveries: sqlIncrement(EmailBroadcasts.deliveries),
					})
					.where(eq(EmailBroadcasts.id, emailDelivery.emailBroadcastId));
			}

			return new Response('Email delivered', { status: 200 });
		}
		case 'email.opened': {
			const { email_id } = data;

			const [emailDelivery] = await dbHttp
				.update(EmailDeliveries)
				.set({
					status: 'opened',
					openedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id))
				.returning({
					flowRunActionId: EmailDeliveries.flowRunActionId,
					emailBroadcastId: EmailDeliveries.emailBroadcastId,
				});

			if (emailDelivery?.flowRunActionId) {
				const flowRunAction = await dbHttp.query.FlowRunActions.findFirst({
					where: eq(FlowRunActions.id, emailDelivery.flowRunActionId),
					columns: {
						flowId: true,
						flowActionId: true,
					},
				});

				if (flowRunAction) {
					await dbHttp
						.update(FlowActions)
						.set({
							opens: sqlIncrement(FlowActions.opens),
						})
						.where(
							and(
								eq(FlowActions.flowId, flowRunAction?.flowId),
								eq(FlowActions.id, flowRunAction?.flowActionId),
							),
						);
				}
			}
			if (emailDelivery?.emailBroadcastId) {
				await dbHttp
					.update(EmailBroadcasts)
					.set({
						opens: sqlIncrement(EmailBroadcasts.opens),
					})
					.where(eq(EmailBroadcasts.id, emailDelivery.emailBroadcastId));
			}

			return new Response('Email opened', { status: 200 });
		}
		case 'email.clicked': {
			const { email_id } = data;

			const [emailDelivery] = await dbHttp
				.update(EmailDeliveries)
				.set({
					status: 'clicked',
					clickedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id))
				.returning({
					// flowActionId: EmailDeliveries.flowActionId,
					flowRunActionId: EmailDeliveries.flowRunActionId,
					emailBroadcastId: EmailDeliveries.emailBroadcastId,
				});

			if (emailDelivery?.flowRunActionId) {
				const flowRunAction = await dbHttp.query.FlowRunActions.findFirst({
					where: eq(FlowRunActions.id, emailDelivery.flowRunActionId),
					columns: {
						flowId: true,
						flowActionId: true,
					},
				});

				if (flowRunAction) {
					await dbHttp
						.update(FlowActions)
						.set({
							clicks: sqlIncrement(FlowActions.clicks),
						})
						.where(
							and(
								eq(FlowActions.flowId, flowRunAction?.flowId),
								eq(FlowActions.id, flowRunAction?.flowActionId),
							),
						);
				}
			}
			if (emailDelivery?.emailBroadcastId) {
				await dbHttp
					.update(EmailBroadcasts)
					.set({
						clicks: sqlIncrement(EmailBroadcasts.clicks),
					})
					.where(eq(EmailBroadcasts.id, emailDelivery.emailBroadcastId));
			}

			return new Response('Email clicked', { status: 200 });
		}
		case 'email.complained': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					status: 'complained',
					complainedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email complained', { status: 200 });
		}
	}
}
