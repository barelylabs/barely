import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';

import type { dbPool } from './pool';
import { env } from '../env';
import * as adCreativeSql from './sql/ad-creative.sql';
import * as adSetSql from './sql/ad-set.sql';
import * as adSql from './sql/ad.sql';
import * as albumSql from './sql/album.sql';
import * as analyticsEndpointSql from './sql/analytics-endpoint.sql';
import * as audienceDemoSql from './sql/audience-demo.sql';
import * as audienceGeoSql from './sql/audience-geo.sql';
import * as audienceInterestSql from './sql/audience-interest.sql';
import * as audienceVidViewsSql from './sql/audience-vid-views.sql';
import * as audienceSql from './sql/audience.sql';
import * as bioSql from './sql/bio.sql';
import * as campaignSql from './sql/campaign.sql';
import * as funnelSql from './sql/cart-funnel.sql';
import * as cartSql from './sql/cart.sql';
import * as domainSql from './sql/domain.sql';
import * as emailAddressSql from './sql/email-address.sql';
import * as emailBroadcastSql from './sql/email-broadcast.sql';
import * as emailDeliverySql from './sql/email-delivery.sql';
import * as emailDomainSql from './sql/email-domain.sql';
import * as emailTemplateSql from './sql/email-template.sql';
import * as eventReportSql from './sql/event-report.sql';
import * as eventSql from './sql/event.sql';
import * as externalWebsiteSql from './sql/external-website.sql';
import * as fanGroupSql from './sql/fan-group.sql';
import * as fanSql from './sql/fan.sql';
import * as fileFolderSql from './sql/file-folder.sql';
import * as fileSql from './sql/file.sql';
import * as flowSql from './sql/flow.sql';
import * as fmSql from './sql/fm.sql';
import * as formResponseSql from './sql/form-response.sql';
import * as formSql from './sql/form.sql';
import * as genreSql from './sql/genre.sql';
import * as invoiceClientSql from './sql/invoice-client.sql';
import * as invoiceEmailSql from './sql/invoice-email.sql';
import * as invoiceSql from './sql/invoice.sql';
import * as landingPageSql from './sql/landing-page.sql';
import * as linkSql from './sql/link.sql';
import * as mixtapeSql from './sql/mixtape.sql';
import * as playlistCoverSql from './sql/playlist-cover.sql';
import * as playlistPitchReviewSql from './sql/playlist-pitch-review.sql';
import * as playlistPlacementSql from './sql/playlist-placement.sql';
import * as playlistSql from './sql/playlist.sql';
import * as pressSql from './sql/press-kit.sql';
import * as productSql from './sql/product.sql';
import * as providerAccountSql from './sql/provider-account.sql';
import * as providerSubAccountSql from './sql/provider-sub-account.sql';
import * as statSql from './sql/stat.sql';
import * as tagSql from './sql/tag.sql';
import * as trackSql from './sql/track.sql';
import * as transactionSql from './sql/transaction.sql';
import * as userSessionSql from './sql/user-session.sql';
import * as userSql from './sql/user.sql';
import * as verificationTokenSql from './sql/verification-token.sql';
import * as vidRenderSql from './sql/vid-render.sql';
import * as vipSwapSql from './sql/vip-swap.sql';
import * as visitorSessionSql from './sql/visitor-session.sql';
import * as workspaceInviteSql from './sql/workspace-invite.sql';
import * as workspaceSql from './sql/workspace.sql';

export const dbSchema = {
	...adSql,
	...adCreativeSql,
	...adSetSql,
	...albumSql,
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
	...emailAddressSql,
	...emailBroadcastSql,
	...emailDomainSql,
	...emailTemplateSql,
	...emailDeliverySql,
	...eventSql,
	...eventReportSql,
	...externalWebsiteSql,
	...fanSql,
	...fanGroupSql,
	...fileSql,
	...fileFolderSql,
	...flowSql,
	...fmSql,
	...formSql,
	...formResponseSql,
	...funnelSql,
	...genreSql,
	...invoiceClientSql,
	...invoiceEmailSql,
	...invoiceSql,
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
	...tagSql,
	...trackSql,
	...transactionSql,
	...userSql,
	...userSessionSql,
	...verificationTokenSql,
	...vidRenderSql,
	...vipSwapSql,
	...visitorSessionSql,
	...workspaceSql,
	...workspaceInviteSql,
};

neonConfig.fetchConnectionCache = true;

const http = neon(env.DATABASE_URL);
export const dbHttp = drizzleHttp({
	client: http,
	schema: dbSchema,
	// casing: 'snake_case',
});

export type DbHttp = typeof dbHttp;
export type DbHttpTransaction = Parameters<Parameters<DbHttp['transaction']>[0]>[0];
export type DbPool = typeof dbPool;

export interface Db {
	http: DbHttp;
	pool: DbPool;
}
