import { emailManageApi } from '@barely/lib/server/routes/email-manage/email-manage.api.server';
import { OPTIONS } from '@barely/lib/utils/trpc-route';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { TRPCError } from '@trpc/server';

async function POST(
	request: Request,
	{ params }: { params: { emailDeliveryId: string } },
) {
	const { emailDeliveryId } = params;

	console.log('unsubscribing from emailDeliveryId', emailDeliveryId);

	try {
		await emailManageApi.toggleEmailMarketingOptIn({
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
	{ params }: { params: { emailDeliveryId: string } },
) {
	const { emailDeliveryId } = params;

	// const domain = new URL(request.url).hostname;

	// return Response.redirect(`https://${domain}/${emailDeliveryId}`);
	return Response.redirect(getAbsoluteUrl('manageEmail', `/manage/${emailDeliveryId}`));
}

export { OPTIONS, GET, POST };
