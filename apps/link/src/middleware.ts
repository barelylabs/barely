import type { RecordClickProps } from '@barely/lib/functions/event.fns';
import type { LinkAnalyticsProps } from '@barely/validators';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { dbHttp } from '@barely/db/client';
import { Links } from '@barely/db/sql/link.sql';
import { sqlAnd } from '@barely/db/utils';
import { recordLinkClick } from '@barely/lib/functions/event.fns';
import { parseLink } from '@barely/lib/middleware';
import { parseReqForVisitorInfo } from '@barely/lib/middleware/request-parsing';
import { getAbsoluteUrl } from '@barely/utils';
import { eq } from 'drizzle-orm';

export const config = {
	matcher: ['/((?!api|mobile|_next|_static|favicon|logos|sitemap|atom|404|500).*)'],
};

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	const url = req.nextUrl;
	const linkProps = parseLink(req);

	//* 🧬 parse the incoming request *//

	const link: LinkAnalyticsProps | undefined = await dbHttp.query.Links.findFirst({
		where: sqlAnd([
			eq(Links.domain, linkProps.domain),
			eq(Links.key, url.pathname.replace('/', '')),
		]),
		columns: {
			// for analytics
			id: true,
			workspaceId: true,
			domain: true,
			handle: true,
			key: true,
			// for routing
			url: true,
			androidScheme: true,
			appleScheme: true,
			externalAppLinkUrl: true,
			// remarketing
			remarketing: true,
			// custom meta tags
			customMetaTags: true,
		},
		with: {
			workspace: {
				columns: {
					id: true,
					plan: true,
					eventUsage: true,
					eventUsageLimitOverride: true,
				},
			},
		},
	});

	//* 🚧 handle route errors 🚧  *//
	if (!link?.url || !link.key) return NextResponse.rewrite(getAbsoluteUrl('link', '404'));

	//* 📈 report event to analytics + remarketing *//

	const visitorInfo = parseReqForVisitorInfo({ req, handle: '', key: link.key });

	const recordClickProps: RecordClickProps = {
		// link data
		link,
		platform: linkProps.platform,
		workspace: link.workspace,
		// visit data
		visitor: visitorInfo,
		type: 'link/click',
		href: linkProps.href,
	};

	ev.waitUntil(recordLinkClick(recordClickProps)); // 👈 record click in background. Will continue after response is sent.

	//* 🧭 route based on device platform and available schemes *//
	// ➡️ 🍏 || 🤖 || 💻

	if (visitorInfo.isBot && link.customMetaTags)
		return NextResponse.redirect(`/_proxy/${link.id}`); // 👈 send bots to proxy for meta tags

	if (link.url.includes('link.dice.fm') && !link.externalAppLinkUrl) {
		const diceUrl = new URL(getAbsoluteUrl('link', '/api/dice'));
		diceUrl.searchParams.set('url', link.url);
		diceUrl.searchParams.set('linkId', link.id);
		await fetch(diceUrl.href, { method: 'POST' });
	}

	if (link.url.includes('open.spotify.com')) {
		const spotifyUrl = new URL(link.url);
		spotifyUrl.searchParams.set('si', ''); // this seems to make a difference in terms of opening the app on desktop
		link.url = spotifyUrl.href;
	}

	if (visitorInfo.userAgent.device === 'mobile') {
		switch (true) {
			case link.url.includes('open.spotify.com'): {
				const spotifyAppLink = new URL('https://spotify.app.link');
				spotifyAppLink.searchParams.set('product', 'open');
				spotifyAppLink.searchParams.set('$full_url', link.url);
				spotifyAppLink.searchParams.set('$fallback_url', link.url);
				spotifyAppLink.searchParams.set('$android_redirect_timeout', '3000');

				return NextResponse.redirect(spotifyAppLink.href);
			}

			case !!link.externalAppLinkUrl: {
				return NextResponse.redirect(link.externalAppLinkUrl);
			}

			default: {
				return NextResponse.redirect(link.url);
			}
		}
	}

	return NextResponse.redirect(link.url);
}
