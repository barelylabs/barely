import type { SQL } from "drizzle-orm";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@barely/lib/server/db/index";
import { recordLinkClick } from "@barely/lib/server/event.fns";
import { Links } from "@barely/lib/server/link.sql";
import { parseLink } from "@barely/lib/server/middleware/utils";
import {
  detectBot,
  parseGeo,
  parseIp,
  parseReferer,
  parseUserAgent,
} from "@barely/lib/utils/middleware";
import { sqlAnd } from "@barely/lib/utils/sql";
import { getAbsoluteUrl } from "@barely/lib/utils/url";
import { eq, isNull } from "drizzle-orm";

import type { RecordClickProps } from "@barely/lib/server/event.fns";
import type { LinkAnalyticsProps } from "@barely/lib/server/link.schema";

export const config = {
  matcher: ["/((?!api|mobile|_next|favicon|logos|sitemap|atom|404|500).*)"],
};

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl;
  const linkProps = parseLink(req);

  console.log("middleware: linkProps", linkProps);
  //* 🧬 parse the incoming request *//

  let where: SQL | undefined = undefined;

  if (linkProps.linkClickType === "transparentLinkClick") {
    if (!linkProps.handle && !linkProps.app)
      return NextResponse.rewrite(getAbsoluteUrl("www", "/link"));

    if (!linkProps.handle)
      return NextResponse.rewrite(getAbsoluteUrl("link", "/404"));

    console.log("handle", linkProps.handle);
    console.log("app", linkProps.app);
    console.log("appRoute", linkProps.appRoute);

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

  // console.log("middleware: where", where);

  if (!where) return NextResponse.rewrite(getAbsoluteUrl("link", "/404"));

  const link: LinkAnalyticsProps | undefined =
    await db.http.query.Links.findFirst({
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

  console.log("middleware: link", link);

  //* 🚧 handle route errors 🚧  *//
  if (!link ?? !link?.url)
    return NextResponse.rewrite(getAbsoluteUrl("link", "404"));

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
