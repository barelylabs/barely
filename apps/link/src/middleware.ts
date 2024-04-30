import type { RecordClickProps } from '@barely/lib/server/routes/event/event.fns';
import type { LinkAnalyticsProps } from '@barely/lib/server/routes/link/link.schema';
import type { SQL } from 'drizzle-orm';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@barely/lib/server/db/index';
import { parseLink } from '@barely/lib/server/middleware/utils';
import { recordLinkClick } from '@barely/lib/server/routes/event/event.fns';
import { Links } from '@barely/lib/server/routes/link/link.sql';
import { parseReqForVisitorInfo } from '@barely/lib/utils/middleware';
import { sqlAnd } from '@barely/lib/utils/sql';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { eq, isNull } from 'drizzle-orm';

export const config = {
	matcher: ['/((?!api|mobile|_next|favicon|logos|sitemap|atom|404|500).*)'],
};

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	const url = req.nextUrl;
	const linkProps = parseLink(req);

	//* 🧬 parse the incoming request *//

	let where: SQL | undefined = undefined;

	if (linkProps.linkClickType === 'transparentLinkClick') {
		if (!linkProps.handle && !linkProps.app) {
			console.log(
				'no handle or app found for transparent link click',
				url.href,
				linkProps,
			);
			return NextResponse.rewrite(getAbsoluteUrl('www', '/link'));
		}

		if (!linkProps.handle) {
			console.log('no handle found for transparent link click', url.href, linkProps);
			return NextResponse.rewrite(getAbsoluteUrl('link', '/404'));
		}

		where = sqlAnd([
			eq(Links.handle, linkProps.handle),
			linkProps.app ? eq(Links.app, linkProps.app) : isNull(Links.app),
			linkProps.appRoute ?
				eq(Links.appRoute, linkProps.appRoute)
			:	isNull(Links.appRoute),
		]);
	} else if (linkProps.linkClickType === 'shortLinkClick') {
		where = sqlAnd([
			eq(Links.domain, linkProps.domain),
			eq(Links.key, url.pathname.replace('/', '')),
		]);
	}

	if (!where) return NextResponse.rewrite(getAbsoluteUrl('link', '/404'));

	const link: LinkAnalyticsProps | undefined = await db.http.query.Links.findFirst({
		where,
		columns: {
			// for analytics
			id: true,
			workspaceId: true,
			domain: true,
			key: true,
			// for routing
			url: true,
			androidScheme: true,
			appleScheme: true,
			// remarketing
			remarketing: true,
			// custom meta tags
			customMetaTags: true,
		},
	});

	console.log('link for ', url.href, link);

	//* 🚧 handle route errors 🚧  *//
	if (!link ?? !link?.url) return NextResponse.rewrite(getAbsoluteUrl('link', '404'));

	//* 📈 report event to analytics + remarketing *//

	const visitorInfo = parseReqForVisitorInfo(req);

	const recordClickProps: RecordClickProps = {
		// link data
		link,
		// visit data
		type: linkProps.linkClickType,
		...visitorInfo,
		href: linkProps.href,
	};

	ev.waitUntil(recordLinkClick(recordClickProps)); // 👈 record click in background. Will continue after response is sent.

	//* 🧭 route based on device platform and available schemes *//
	// ➡️ 🍏 || 🤖 || 💻

	if (visitorInfo.isBot && link.customMetaTags)
		return NextResponse.redirect(`/_proxy/${link.id}`); // 👈 send bots to proxy for meta tags

	if (visitorInfo.ua.device === 'mobile') {
		if (link.url.includes('open.spotify.com')) {
			console.log('Spotify link detected on mobile');
			const spotifyAppLink = new URL('https://spotify.app.link');
			spotifyAppLink.searchParams.set('product', 'open');
			spotifyAppLink.searchParams.set('$full_url', link.url);
			spotifyAppLink.searchParams.set('$fallback_url', link.url);
			spotifyAppLink.searchParams.set('$android_redirect_timeout', '3000');
			console.log('redirecting to mobile spotify', spotifyAppLink.href);
			return NextResponse.redirect(spotifyAppLink.href);
		}
	}

	return NextResponse.redirect(link.url);
}
