import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";

import { env } from "../../env";
import * as adCreativeSql from "../ad-creative.sql";
import * as adSetSql from "../ad-set.sql";
import * as adSql from "../ad.sql";
import * as analyticsEndpointSql from "../analytics-endpoint.sql";
import * as audienceDemoSql from "../audience-demo.sql";
import * as audienceGeoSql from "../audience-geo.sql";
import * as audienceInterestSql from "../audience-interest.sql";
import * as audienceVidViewsSql from "../audience-vid-views.sql";
import * as audienceSql from "../audience.sql";
import * as bioSql from "../bio.sql";
import * as campaignSql from "../campaign.sql";
import * as domainSql from "../domain.sql";
import * as eventReportSql from "../event-report.sql";
import * as eventSql from "../event.sql";
import * as externalWebsiteSql from "../external-website.sql";
import * as fileFolderSql from "../file-folder.sql";
import * as fileSql from "../file.sql";
import * as formResponseSql from "../form-response.sql";
import * as formSql from "../form.sql";
import * as genreSql from "../genre.sql";
import * as linkSql from "../link.sql";
import * as mixtapeSql from "../mixtape.sql";
import * as playlistCoverSql from "../playlist-cover.sql";
import * as playlistPitchReviewSql from "../playlist-pitch-review.sql";
import * as playlistPlacementSql from "../playlist-placement.sql";
import * as playlistSql from "../playlist.sql";
import * as pressSql from "../press-kit.sql";
import * as providerAccountSql from "../provider-account.sql";
import * as providerSubAccountSql from "../provider-sub-account.sql";
import * as statSql from "../stat.sql";
import * as trackSql from "../track.sql";
import * as transactionSql from "../transaction.sql";
import * as userSessionSql from "../user-session.sql";
import * as userSql from "../user.sql";
import * as verificationTokenSql from "../verification-token.sql";
import * as vidRenderSql from "../vid-render.sql";
import * as visitorSessionSql from "../visitor-session.sql";
import * as workspaceSql from "../workspace.sql";

export const dbSchema = {
  ...adSql,
  ...adCreativeSql,
  ...adSetSql,
  ...analyticsEndpointSql,
  ...audienceSql,
  ...audienceDemoSql,
  ...audienceGeoSql,
  ...audienceInterestSql,
  ...audienceVidViewsSql,
  ...bioSql,
  ...campaignSql,
  ...domainSql,
  ...eventSql,
  ...eventReportSql,
  ...externalWebsiteSql,
  ...fileSql,
  ...fileFolderSql,
  ...formSql,
  ...formResponseSql,
  ...genreSql,
  ...linkSql,
  ...mixtapeSql,
  ...playlistSql,
  ...playlistCoverSql,
  ...playlistPitchReviewSql,
  ...playlistPlacementSql,
  ...pressSql,
  ...providerAccountSql,
  ...providerSubAccountSql,
  ...statSql,
  ...workspaceSql,
  ...trackSql,
  ...transactionSql,
  ...userSql,
  ...userSessionSql,
  ...verificationTokenSql,
  ...vidRenderSql,
  ...visitorSessionSql,
};

neonConfig.fetchConnectionCache = true;

const http = neon(env.DATABASE_URL);
const dbHttp = drizzleHttp(http, {
  schema: dbSchema,
});

const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
export const dbPool = drizzlePool(pool, {
  schema: dbSchema,
});

export type DbHttp = typeof dbHttp;
export type DbHttpTransaction = Parameters<
  Parameters<DbHttp["transaction"]>[0]
>[0];
export type DbPool = typeof dbPool;
export type DbPoolTransaction = Parameters<
  Parameters<DbPool["transaction"]>[0]
>[0];

export interface Db {
  http: DbHttp;
  pool: DbPool;
}

export const db: Db = {
  http: dbHttp,
  pool: dbPool,
};
