import { eq } from 'drizzle-orm';

import { dbHttp } from '../../db';
import { emailEventSchema } from './email-delivery.schema';
import { EmailDeliveries } from './email-delivery.sql';

export async function handleEmailEvent(payload: unknown) {
	const event = emailEventSchema.safeParse(payload);

	if (!event.success) {
		return new Response('Invalid event', { status: 400 });
	}

	const { type, data } = event.data;

	switch (type) {
		case 'email.bounced': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					bouncedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email bounced', { status: 200 });
		}
		case 'email.delivered': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					deliveredAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email delivered', { status: 200 });
		}
		case 'email.opened': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					openedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email opened', { status: 200 });
		}
		case 'email.clicked': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					clickedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email clicked', { status: 200 });
		}
		case 'email.complained': {
			const { email_id } = data;

			await dbHttp
				.update(EmailDeliveries)
				.set({
					complainedAt: new Date(),
				})
				.where(eq(EmailDeliveries.resendId, email_id));

			return new Response('Email complained', { status: 200 });
		}
	}
}
