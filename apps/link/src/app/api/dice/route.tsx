import type { NextRequest } from 'next/server';
import { getDiceAppLinkUrl } from '@barely/lib/server/routes/link/link.appLinks';
import { getSearchParams } from '@barely/lib/utils/url';

export async function POST(req: NextRequest) {
	const searchParams = getSearchParams(req.url);
	const { url, linkId } = searchParams;

	console.log('dice url to check for redirects', url);

	if (!url) {
		return new Response('No URL found in query params', { status: 400 });
	}

	if (!linkId) {
		return new Response('No linkId found in query params', { status: 4000 });
	}

	await getDiceAppLinkUrl({ url, linkId });

	return new Response('dice external app link tracked', { status: 200 });
}
