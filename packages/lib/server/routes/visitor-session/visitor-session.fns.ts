import type { NextRequest } from 'next/server';
import { userAgent } from 'next/server';

export function getDeviceData(req: NextRequest) {
	const deviceProps = userAgent(req);

	const { os, browser, ua } = deviceProps;

	const platform =
		(
			(os?.name?.toLowerCase().includes('ios') ??
			browser?.name?.toLowerCase().includes('mobile safari') ??
			ua?.toLowerCase().includes('iphone' || 'ipad'))
		) ?
			'ios'
		: os?.name?.toLowerCase().includes('android') ? 'android'
		: 'web';

	return { platform, ...deviceProps };
}

export function parseTransparentLink(req: NextRequest) {
	const domain = req.headers
		.get('host')
		?.replace(
			`localhost:${process.env.NEXT_PUBLIC_LINK_DEV_PORT}`,
			`${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
		)
		?.replace('www.', '');

	if (!domain) throw new Error('No domain found');

	const handle = domain.split('.').length === 3 ? (domain.split('.')[0] ?? null) : null;

	// path is the path of the URL (e.g. properyouth.barely.link/spotify/track/12345 => /spotify/track/12345)
	const path = req.nextUrl.pathname;

	// fullPath is the full URL path (including query params)
	const searchParams = req.nextUrl.searchParams.toString();
	const fullPath = `${path}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	// Here, we are using decodeURIComponent to handle foreign languages
	const app = decodeURIComponent(path.split('/')[1] ?? ''); // app is the first part of the path (e.g. properyouth.barely.link/spotify/track/12345 => spotify)
	// appRoute is the rest of the path (e.g. properyouth.barely.link/spotify/track/12345?si=aparam => track/12345?si=aparam)
	const appRoute = decodeURIComponent(fullPath.split('/').slice(2).join('/'));

	return { handle, domain, path, fullPath, app, appRoute };
}
