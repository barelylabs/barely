import type { NextRequest } from 'next/server';

import type { RecordClickProps } from '../routes/event/event.fns';
import type { FM_LINK_PLATFORMS } from '../routes/fm/fm.constants';
import { getDomainWithoutWWW } from '../../utils/link';
import { raise } from '../../utils/raise';
import { getSearchParams } from '../../utils/url';

export interface ParseLinkOutput {
	domain: string;
	href: string;
	linkClickType: RecordClickProps['type'];
}

export function parseLinkDomain(req: NextRequest) {
	const host = req.headers.get('host');
	console.log('host', host);

	const hrefRaw = req.nextUrl.href;
	console.log('hrefRaw', hrefRaw);

	let domain = req.headers
		.get('host')
		?.replace(
			`localhost:${process.env.NEXT_PUBLIC_LINK_DEV_PORT}`,
			`${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
		)
		?.replace('www.', '');

	console.log('domain from req', domain);
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

	const searchParams = getSearchParams(req.nextUrl.href);
	console.log('searchParams', searchParams);

	const handleParam = req.nextUrl.searchParams.get('handle');
	console.log('handleParam', handleParam);

	if (domain.match(/^link-.+-barely\.vercel\.app$/) && handleParam) {
		domain = `${handleParam}.${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`;
	}

	console.log('domain after parsing', domain);

	// if hostname is {handle}.barely.link, it's a transparent link. otherwise, it's a short link
	const linkClickType: RecordClickProps['type'] =
		domain.endsWith(`.${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`) ?
			'transparent'
		:	'short';

	if (
		linkClickType === 'short' &&
		(process.env.VERCEL_ENV === 'development' || process.env.VERCEL_ENV === 'preview')
	) {
		const domainParam = req.nextUrl.searchParams.get('domain');
		console.log('domainParam', domainParam);

		if (!domainParam)
			throw new Error(
				'Domain query parameter not provided. We need that to test in local & preview environments',
			);

		domain =
			getDomainWithoutWWW(domainParam) ?? raise('Domain query parameter is invalid');
	}

	const href = ('https://' + domain + req.nextUrl.pathname).replace(
		`localhost:${process.env.NEXT_PUBLIC_LINK_DEV_PORT}`,
		`${process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN}`,
	);

	const platform: (typeof FM_LINK_PLATFORMS)[number] | undefined =
		href.includes('music.amazon') ? 'amazonMusic'
		: href.includes('music.apple') ? 'appleMusic'
		: href.includes('deezer') ? 'deezer'
		: href.includes('app=itunes') ? 'itunes'
		: href.includes('open.spotify') ? 'spotify'
		: href.includes('tidal.com') ? 'tidal'
		: href.includes('tiktok.com') ? 'tiktok'
		: href.includes('music.youtube') ? 'youtubeMusic'
		: href.includes('youtu.be') || href.includes('youtube') ? 'youtube'
		: undefined;

	return { domain, href, linkClickType, platform };
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

	// path is the path of the URL (e.g. properyouth.barely.link/spotify/track/12345 => /spotify/track/12345)
	const path = req.nextUrl.pathname;

	// fullPath is the full URL path (including query params)
	const searchParams = req.nextUrl.searchParams.toString();
	const fullPath = `${path}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

	// Here, we are using decodeURIComponent to handle foreign languages
	const app = decodeURIComponent(path.split('/')[1] ?? ''); // app is the first part of the path (e.g. properyouth.barely.link/spotify/track/12345 => spotify)

	// appRoute is the rest of the path (e.g. properyouth.barely.link/spotify/track/12345 => track/12345)
	const appRoute = decodeURIComponent(path.split('/').slice(2).join('/'));

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
	const { href, linkClickType, platform } = parseLinkDomain(req);

	if (linkClickType === 'transparent') {
		return {
			linkClickType,
			href,
			platform,
			...parseTransparentLink(req),
		};
	} else if (linkClickType === 'short') {
		return {
			linkClickType,
			href,
			platform,
			...parseShortLink(req),
		};
	} else {
		throw new Error('Invalid link click type');
	}
}
