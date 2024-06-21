import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import type { DbPool } from './pool';
import { env } from '../../env';
import * as adCreativeSql from '../routes/ad-creative/ad-creative.sql';
import * as adSetSql from '../routes/ad-set/ad-set.sql';
import * as adSql from '../routes/ad/ad.sql';
import * as analyticsEndpointSql from '../routes/analytics-endpoint/analytics-endpoint.sql';
import * as audienceDemoSql from '../routes/audience/audience-demo.sql';
import * as audienceGeoSql from '../routes/audience/audience-geo.sql';
import * as audienceInterestSql from '../routes/audience/audience-interest.sql';
import * as audienceVidViewsSql from '../routes/audience/audience-vid-views.sql';
import * as audienceSql from '../routes/audience/audience.sql';
import * as verificationTokenSql from '../routes/auth/verification-token.sql';
import * as bioSql from '../routes/bio/bio.sql';
import * as campaignSql from '../routes/campaign/campaign.sql';
import * as funnelSql from '../routes/cart-funnel/cart-funnel.sql';
import * as cartSql from '../routes/cart/cart.sql';
import * as domainSql from '../routes/domain/domain.sql';
import * as eventReportSql from '../routes/event/event-report.sql';
import * as eventSql from '../routes/event/event.sql';
import * as externalWebsiteSql from '../routes/external-website/external-website.sql';
import * as fanSql from '../routes/fan/fan.sql';
import * as fileFolderSql from '../routes/file/file-folder.sql';
import * as fileSql from '../routes/file/file.sql';
import * as formResponseSql from '../routes/form/form-response.sql';
import * as formSql from '../routes/form/form.sql';
import * as genreSql from '../routes/genre/genre.sql';
import * as landingPageSql from '../routes/landing-page/landing-page.sql';
import * as linkSql from '../routes/link/link.sql';
import * as mixtapeSql from '../routes/mixtape/mixtape.sql';
import * as playlistPitchReviewSql from '../routes/playlist-pitch-review/playlist-pitch-review.sql';
import * as playlistPlacementSql from '../routes/playlist-placement/playlist-placement.sql';
import * as playlistCoverSql from '../routes/playlist/playlist-cover.sql';
import * as playlistSql from '../routes/playlist/playlist.sql';
import * as pressSql from '../routes/press-kit/press-kit.sql';
import * as productSql from '../routes/product/product.sql';
import * as providerAccountSql from '../routes/provider-account/provider-account.sql';
import * as providerSubAccountSql from '../routes/provider-account/provider-sub-account.sql';
import * as statSql from '../routes/stat/stat.sql';
import * as trackSql from '../routes/track/track.sql';
import * as transactionSql from '../routes/transaction/transaction.sql';
import * as userSessionSql from '../routes/user/user-session.sql';
import * as userSql from '../routes/user/user.sql';
import * as visitorSessionSql from '../routes/visitor-session/visitor-session.sql';
import * as workflowSql from '../routes/workflow/workflow.sql';
import * as workspaceInviteSql from '../routes/workspace-invite/workspace-invite.sql';
import * as workspaceSql from '../routes/workspace/workspace.sql';
import * as vidRenderSql from '../vid-render.sql';

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
	...cartSql,
	...domainSql,
	...eventSql,
	...eventReportSql,
	...externalWebsiteSql,
	...fanSql,
	...fileSql,
	...fileFolderSql,
	...formSql,
	...formResponseSql,
	...funnelSql,
	...genreSql,
	...landingPageSql,
	...linkSql,
	...mixtapeSql,
	...playlistSql,
	...playlistCoverSql,
	...playlistPitchReviewSql,
	...playlistPlacementSql,
	...pressSql,
	...productSql,
	...providerAccountSql,
	...providerSubAccountSql,
	...statSql,
	...trackSql,
	...transactionSql,
	...userSql,
	...userSessionSql,
	...verificationTokenSql,
	...vidRenderSql,
	...visitorSessionSql,
	...workflowSql,
	...workspaceSql,
	...workspaceInviteSql,
};

neonConfig.fetchConnectionCache = true;

const http = neon(env.DATABASE_URL);
export const dbHttp = drizzleHttp(http, {
	schema: dbSchema,
});

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
export const dbPool = drizzlePool(pool, {
	schema: dbSchema,
});

export type DbHttp = typeof dbHttp;
export type DbHttpTransaction = Parameters<Parameters<DbHttp['transaction']>[0]>[0];
// export type DbPool = typeof dbPool;
// export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];

// export type DbPool = ReturnType<typeof dbPoolo>;
// export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];
// export type DbPoolTransaction = DbHttpTransaction;

export interface Db {
	http: DbHttp;
	pool: DbPool;
	// pool: DbHttp;
}

// export const db: Db = {
// 	http: dbHttp,
// 	pool: dbHttp, // having issues w/ pool handling in different environments (serverless, localhost, trigger.dev).
// 	/* https://neon.tech/docs/serverless/serverless-driver#use-the-driver-over-websockets
//     Probably need to properly iniitalize the pool in the route handler, pass to trpc as context, and then ctx.waitUntil(pool.end()) in the route handler

//     */
// 	// pool: dbPoolo(),
// };
