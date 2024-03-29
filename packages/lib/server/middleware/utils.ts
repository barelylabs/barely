import type { NextRequest } from 'next/server';

import type { RecordClickProps } from '../event.fns';
import { getDomainWithoutWWW } from '../../utils/link';
import { raise } from '../../utils/raise';

export interface ParseLinkOutput {
	domain: string;
	href: string;
	linkClickType: RecordClickProps['type'];
}

export function parseLinkDomain(req: NextRequest) {
	let domain = req.headers
		.get('host')
		?.replace(
			`localhost:${process.env.NEXT_PUBLIC_LINK_DEV_PORT}`,
			`${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
		)
		?.replace('www.', '');

	console.log('parseLinkDomain: domain', domain);

	if (!domain) throw new Error('No domain found');

	// special case for Vercel preview deployment URLs
	if (
		domain.includes('---') &&
		domain.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
	) {
		domain = `${domain.split('---')[0]}.${
			process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN
		}`;
	}

	// if hostname is {handle}.barely.link, it's a transparent link. otherwise, it's a short link
	const linkClickType: RecordClickProps['type'] = domain.endsWith(
		`.${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
	)
		? 'transparentLinkClick'
		: 'shortLinkClick';

	console.log('parseLinkDomain: linkClickType', linkClickType);

	if (
		linkClickType === 'shortLinkClick' &&
		(process.env.VERCEL_ENV === 'development' || process.env.VERCEL_ENV === 'preview')
	) {
		const domainParam = req.nextUrl.searchParams.get('domain');
		if (!domainParam)
			throw new Error(
				'Domain query parameter not provided. We need that to test in local & preview environments',
			);

		console.log('domainParam', domainParam);
		``;
		domain =
			getDomainWithoutWWW(domainParam) ?? raise('Domain query parameter is invalid');

		console.log('domain', domain);
	}

	const href = ('https://' + domain + req.nextUrl.pathname).replace(
		`localhost:${process.env.NEXT_PUBLIC_LINK_DEV_PORT}`,
		`${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
	);

	console.log('parseLinkDomain: href', href);

	return { domain, href, linkClickType };
}

export interface TransparentLinkParams {
	handle: string | null;
	domain: string;
	path: string;
	fullPath: string;
	app: string;
	appRoute: string | null;
}

export function parseTransparentLink(req: NextRequest) {
	const { domain } = parseLinkDomain(req);

	const handle = domain.split('.').length === 3 ? domain.split('.')[0] ?? null : null;

	console.log('parseTransparentLink: handle', handle);

	// path is the path of the URL (e.g. properyouth.barely.link/spotify/track/12345 => /spotify/track/12345)
	const path = req.nextUrl.pathname;
	console.log('parseTransparentLink: path', path);

	// fullPath is the full URL path (including query params)
	const searchParams = req.nextUrl.searchParams.toString();
	const fullPath = `${path}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	console.log('parseTransparentLink: fullPath', fullPath);

	// Here, we are using decodeURIComponent to handle foreign languages
	const app = decodeURIComponent(path.split('/')[1] ?? ''); // app is the first part of the path (e.g. properyouth.barely.link/spotify/track/12345 => spotify)
	console.log('parseTransparentLink: app', app);
	console.log('parseTransparentLink type: ', typeof app);
	console.log('parseTransparentLink length: ', app.length);
	// appRoute is the rest of the path (e.g. properyouth.barely.link/spotify/track/12345?si=aparam => track/12345?si=aparam)
	const appRoute = decodeURIComponent(fullPath.split('/').slice(2).join('/'));

	const transparentLinkParams: TransparentLinkParams = {
		handle,
		domain,
		path,
		fullPath,
		app,
		appRoute: appRoute.length > 0 ? appRoute : null,
	};
	return transparentLinkParams;
}

export function parseShortLink(req: NextRequest) {
	const { domain } = parseLinkDomain(req);

	const key = req.nextUrl.pathname;

	const searchParams = req.nextUrl.searchParams.toString();
	const fullPath = `${key}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	return { domain, key, fullPath, searchParams };
}

export function parseLink(req: NextRequest) {
	const { href, linkClickType } = parseLinkDomain(req);

	if (linkClickType === 'transparentLinkClick') {
		return {
			linkClickType,
			href,
			...parseTransparentLink(req),
		};
	} else if (linkClickType === 'shortLinkClick') {
		return {
			linkClickType,
			href,
			...parseShortLink(req),
		};
	} else {
		throw new Error('Invalid link click type');
	}
}
