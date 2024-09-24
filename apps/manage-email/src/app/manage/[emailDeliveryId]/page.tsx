import { dbPool } from '@barely/lib/server/db/pool';
import { EmailDeliveries } from '@barely/lib/server/routes/email-delivery/email-delivery.sql';
import { queryBooleanSchema } from '@barely/lib/utils/zod-helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { H } from '@barely/ui/elements/typography';

import { ManageEmailForm } from '~/app/manage/[emailDeliveryId]/manage-email-form';

const searchParamsSchema = z.object({
	unsubscribed: queryBooleanSchema.optional(),
});

export default async function ManageEmailDeliveryPage({
	params,
	searchParams,
}: {
	params: { emailDeliveryId: string };
	searchParams: z.infer<typeof searchParamsSchema>;
}) {
	const { emailDeliveryId } = params;
	const { unsubscribed } = searchParamsSchema.parse(searchParams);

	console.log('emailDeliveryId', emailDeliveryId);
	console.log('unsubscribed', unsubscribed);

	const emailDelivery = await dbPool.query.EmailDeliveries.findFirst({
		where: eq(EmailDeliveries.id, emailDeliveryId),
		with: {
			fan: {
				columns: {
					emailMarketingOptIn: true,
					firstName: true,
					lastName: true,
					email: true,
				},
			},
			workspace: {
				columns: {
					name: true,
					handle: true,
				},
			},
		},
	});

	if (!emailDelivery) {
		return <div>Email not found</div>;
	}

	const workspaceDisplayName =
		emailDelivery.workspace.name.length > 0 ?
			emailDelivery.workspace.name
		:	emailDelivery.workspace.handle;

	console.log('workspaceDisplayName', workspaceDisplayName);

	return (
		<div className='mx-auto flex max-w-lg flex-col items-center gap-10'>
			<H size='2' className='text-center'>
				Manage Your Subscription to {workspaceDisplayName}
			</H>
			<ManageEmailForm
				emailDeliveryId={emailDeliveryId}
				initialEmailMarketingOptIn={emailDelivery.fan.emailMarketingOptIn}
				justUnsubscribed={unsubscribed}
			/>
		</div>
	);
}
