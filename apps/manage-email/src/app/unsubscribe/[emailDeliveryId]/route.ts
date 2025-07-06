import { getAbsoluteUrl, OPTIONS } from '@barely/utils';
import { TRPCError } from '@trpc/server';

import { trpcCaller } from '~/trpc/server';

async function POST(
	request: Request,
	{ params }: { params: Promise<{ emailDeliveryId: string }> },
) {
	const { emailDeliveryId } = await params;

	console.log('unsubscribing from emailDeliveryId', emailDeliveryId);

	try {
		await trpcCaller.toggleEmailMarketingOptIn({
			emailDeliveryId,
			forceUnsubscribe: true,
		});

		return Response.json({}, { status: 200 });
	} catch (error) {
		if (error instanceof TRPCError) {
			console.error(error);
			return Response.json({ error: error.message }, { status: 500 });
		}

		console.error(error);
		return Response.json({ error: 'Something went wrong' }, { status: 500 });
	}
}

/* GET for webcrawlers of POST Header */
async function GET(
	request: Request,
	{ params }: { params: Promise<{ emailDeliveryId: string }> },
) {
	const { emailDeliveryId } = await params;

	return Response.redirect(getAbsoluteUrl('manageEmail', `/manage/${emailDeliveryId}`));
}

export { OPTIONS, GET, POST };
