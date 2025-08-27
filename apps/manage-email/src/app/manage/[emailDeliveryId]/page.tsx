import { dbHttp } from '@barely/db/client';
import { EmailDeliveries } from '@barely/db/sql/email-delivery.sql';
import { queryBooleanSchema } from '@barely/validators/helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { H } from '@barely/ui/typography';

import { ManageEmailForm } from '~/app/manage/[emailDeliveryId]/manage-email-form';

const searchParamsSchema = z.object({
	unsubscribed: queryBooleanSchema.optional(),
});

export default async function ManageEmailDeliveryPage({
	params,
	searchParams,
}: {
	params: Promise<{ emailDeliveryId: string }>;
	searchParams: Promise<z.infer<typeof searchParamsSchema>>;
}) {
	const { emailDeliveryId } = await params;
	const { unsubscribed } = searchParamsSchema.parse(await searchParams);

	const emailDelivery = await dbHttp.query.EmailDeliveries.findFirst({
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
