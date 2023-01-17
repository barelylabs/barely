import { type NextRequest, userAgent } from 'next/server';
import { linkBaseSchema } from '@barely/schema/db/link';
import { handleUndefined } from '.';

export function getDeviceData(req: NextRequest) {
	const deviceProps = userAgent(req);

	const { os, browser, ua } = deviceProps;

	const platform =
		os?.name?.toLowerCase().includes('ios') ||
		browser?.name?.toLowerCase().includes('mobile safari') ||
		ua?.toLowerCase().includes('iphone' || 'ipad')
			? 'ios'
			: os?.name?.toLowerCase().includes('android')
			? 'android'
			: 'web';

	return { platform, ...deviceProps };
}

export function getPathParams(req: NextRequest) {
	const { origin, searchParams, pathname, hostname, protocol } = req.nextUrl;

	const isLocal = protocol === 'http:' && hostname === 'localhost';
	const params = Object.fromEntries(searchParams.entries());
	const host = hostname.split('.');

	console.log('origin => ', origin);
	console.log('isLocal => ', isLocal);
	console.log('params => ', params);
	console.log('host => ', host);

	// handle
	const handle = isLocal ? params.handle : host[0];

	// link path params
	const tld = isLocal ? params.tld : host[2];
	const slug = tld === 'to' ? pathname : null;
	const [appString, appRouteString, appIdString] =
		tld === 'link' ? pathname.split('/').slice(1) : [null];

	console.log('appString => ', appString);
	const parsedApp = linkBaseSchema.shape.app.safeParse(appString);
	const app = parsedApp.success ? parsedApp.data : null;
	console.log('parsedApp => ', app);

	const appRoute = handleUndefined.toNull(appRouteString);
	const appId = handleUndefined.toNull(appIdString);

	console.log('handle => ', handle);
	console.log('tld => ', tld);
	console.log('slug => ', slug);
	console.log('app => ', app);
	console.log('appRoute => ', appRoute);
	console.log('appId => ', appId);

	const linkPathParams = {
		isLocal,
		origin,
		pathname,
		handle,
		slug,
		app,
		appRoute,
		appId,
	};
	return linkPathParams;
}
