import type { z } from "zod";
import { eq } from "drizzle-orm";

import type { visitorSessionTinybirdSchema } from "./event.tb";
// import { recordEventToTinybird } from './event.tb';
import type { LinkAnalyticsProps } from "./link.schema";
import type { NextFormattedUserAgent, NextGeo } from "./next.schema";
import { env } from "../env";
import { newId } from "../utils/id";
import { sqlIncrement } from "../utils/sql";
import { ratelimit } from "../utils/upstash";
import { AnalyticsEndpoints } from "./analytics-endpoint.sql";
import { db } from "./db";
import { ingestWebEvent, webEventIngestSchema } from "./event.tb";
import { Links } from "./link.sql";
import { reportEventToMeta } from "./meta.endpts.event";
import { Workspaces } from "./workspace.sql";

/**
 * Record clicks with geo, ua, referer, and timestamp data
 * If linkId is not specified, it's a root click (key="_root", eg. properyouth.barely.link, or properyouth.link)
 */

export type RecordClickProp = z.infer<typeof visitorSessionTinybirdSchema>;

export interface RecordClickProps {
  link: LinkAnalyticsProps;
  type: "transparentLinkClick" | "shortLinkClick";
  href: string;
  // visitor data
  ip: string;
  geo: NextGeo;
  ua: NextFormattedUserAgent;
  isBot: boolean;
  referer: string | null;
  referer_url: string | null;
}

export async function recordLinkClick({
  link,
  type,
  href,
  ip,
  geo,
  ua,
  referer,
  referer_url,
  isBot,
}: RecordClickProps) {
  console.log("isBot => ", isBot);

  if (isBot) return null;

  console.log("not a bot, so check if ip is rate limited.");

  // deduplicate clicks from the same ip & linkId - only record 1 link click per ip per linkId per hour
  console.log(
    "process.env.RATE_LIMIT_RECORD_LINK_CLICK => ",
    process.env.RATE_LIMIT_RECORD_LINK_CLICK,
  );
  console.log(
    "env.RATE_LIMIT_RECORD_LINK_CLICK => ",
    env.RATE_LIMIT_RECORD_LINK_CLICK,
  );

  // const rateLimitPeriod = env.RATE_LIMIT_RECORD_LINK_CLICK ?? '1 h'; //fixme: why is this undefined?
  const rateLimitPeriod = "1 s";

  console.log("rateLimitPeriod => ", rateLimitPeriod);

  const { success } = await ratelimit(10, rateLimitPeriod).limit(
    `recordClick:${ip}:${link.id ?? "_root"}`,
  );

  console.log("rate limit exceeded => ", !success);

  if (!success) return null;

  console.log("we are not rate limited.");

  const time = Date.now();
  const timestamp = new Date(time).toISOString();

  // increment the link click count in db
  await db.http
    .update(Links)
    .set({ clicks: sqlIncrement(Links.clicks) })
    .where(eq(Links.id, link.id));

  // increment the workspace link usage count in db
  await db.http
    .update(Workspaces)
    .set({ linkUsage: sqlIncrement(Workspaces.linkUsage) })
    .where(eq(Workspaces.id, link.workspaceId));

  /**
   * 👾 remarketing/analytics 👾
   *  */

  const analyticsEndpoints = link.remarketing
    ? await db.pool.query.AnalyticsEndpoints.findMany({
        where: eq(AnalyticsEndpoints.workspaceId, link.workspaceId),
      })
    : [];

  // ∞ Meta ∞
  const metaPixel = analyticsEndpoints.find(
    (endpoint) => endpoint.platform === "meta",
  );
  const metaRes = metaPixel?.accessToken
    ? await reportEventToMeta({
        pixelId: metaPixel.id,
        accessToken: metaPixel.accessToken,
        testEventCode: "TEST37240",
        url: href,
        ip,
        ua: ua.ua,
        eventName: "ViewContent",
        geo,
      })
    : { reported: false };

  // ♪ TikTok ♪

  /**
   * 👾 end remarketing/analytics 👾
   */

  // report event to tinybird

  try {
    const eventData = webEventIngestSchema.parse({
      timestamp,
      workspaceId: link.workspaceId,
      assetId: link.id,
      sessionId: newId("webSession"),
      href,
      // link specifics (short link or transparent link)
      type,
      domain: type === "shortLinkClick" ? link.domain : undefined,
      key: type === "shortLinkClick" ? link.key : undefined,
      // analytics
      ...geo,
      ...ua,
      referer,
      referer_url,
      reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : "false",
    });

    const tinybirdRes = await ingestWebEvent(eventData);

    console.log("tinybirdRes => ", tinybirdRes);
  } catch (error) {
    console.log("error => ", error);
    throw new Error("ah!");
  }

  // console.log('tinybirdRes => ', tinybirdRes);

  return true;
}
