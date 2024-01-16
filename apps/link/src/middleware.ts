import type { SQL } from "drizzle-orm";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@barely/lib/server/db/index";
import { recordLinkClick } from "@barely/lib/server/event.fns";
import { Links } from "@barely/lib/server/link.sql";
import { parseLink } from "@barely/lib/server/middleware/utils";
// import { LINK_BASE_URL, WWW_BASE_URL } from "@barely/lib/utils/constants";
import {
  detectBot,
  parseGeo,
  parseIp,
  parseReferer,
  parseUserAgent,
} from "@barely/lib/utils/middleware";
import { sqlAnd } from "@barely/lib/utils/sql";
import { absoluteUrl } from "@barely/lib/utils/url";
import { eq, isNull } from "drizzle-orm";

import type { RecordClickProps } from "@barely/lib/server/event.fns";
import type { LinkAnalyticsProps } from "@barely/lib/server/link.schema";

import env from "~/env";

export const config = {
  matcher: ["/((?!api|mobile|_next|favicon|logos|sitemap|atom|404|500).*)"],
};

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl;
  const linkProps = parseLink(req);

  //* 🧬 parse the incoming request *//

  if (
    linkProps.linkClickType === "transparentLinkClick" &&
    !linkProps.handle &&
    !linkProps.app
  )
    return NextResponse.rewrite(`${env.NEXT_PUBLIC_WWW_BASE_URL}/link`);

  if (linkProps.linkClickType === "transparentLinkClick" && !linkProps.handle)
    return NextResponse.rewrite(`${env.NEXT_PUBLIC_LINK_BASE_URL}/404`);

  let where: SQL | undefined = undefined;

  if (linkProps.linkClickType === "transparentLinkClick") {
    if (!linkProps.handle && !linkProps.app)
      // return NextResponse.rewrite(`${WWW_BASE_URL}/link`);
      return NextResponse.rewrite(absoluteUrl("www", "/link"));

    // if (!linkProps.handle) return NextResponse.rewrite(`${LINK_BASE_URL}/404`);
    if (!linkProps.handle)
      return NextResponse.rewrite(absoluteUrl("link", "/404"));

    where = sqlAnd([
      eq(Links.handle, linkProps.handle),
      linkProps.app ? eq(Links.app, linkProps.app) : isNull(Links.app),
      linkProps.appRoute
        ? eq(Links.appRoute, linkProps.appRoute)
        : isNull(Links.appRoute),
    ]);
  } else if (linkProps.linkClickType === "shortLinkClick") {
    where = sqlAnd([
      eq(Links.domain, linkProps.domain),
      eq(Links.key, url.pathname.replace("/", "")),
    ]);
  }

  // if (!where) return NextResponse.rewrite(`${LINK_BASE_URL}/404`);
  if (!where) return NextResponse.rewrite(absoluteUrl("link", "/404"));

  const link: LinkAnalyticsProps | undefined =
    await db.read.query.Links.findFirst({
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

  //* 🚧 handle route errors 🚧  *//
  if (!link ?? !link?.url) return NextResponse.rewrite(`${origin}/404`);

  //* 📈 report event to analytics + remarketing *//
  const ip = parseIp(req);
  const geo = parseGeo(req);
  const ua = parseUserAgent(req);
  const isBot = detectBot(req);

  const { referer, referer_url } = parseReferer(req);

  const recordClickProps: RecordClickProps = {
    // link data
    link,
    href: linkProps.href,
    // visit data
    type: linkProps.linkClickType,
    ip,
    geo,
    ua,
    isBot,
    referer,
    referer_url,
  };

  ev.waitUntil(recordLinkClick(recordClickProps)); // 👈 record click in background. Will continue after response is sent.

  //* 🧭 route based on device platform and available schemes *//
  // ➡️ 🍏 || 🤖 || 💻

  if (isBot && link.customMetaTags)
    return NextResponse.redirect(`/_proxy/${link.id}`); // 👈 send bots to proxy for meta tags

  return NextResponse.redirect(link.url); // 👈 just doing url redirects for now
}
