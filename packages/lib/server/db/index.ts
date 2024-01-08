import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { Client } from '@polyscale/serverless-js';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';

import env from '../../env';
import * as adCreativeSql from '../ad-creative.sql';
import * as adSetSql from '../ad-set.sql';
import * as adSql from '../ad.sql';
import * as analyticsEndpointSql from '../analytics-endpoint.sql';
import * as audienceDemoSql from '../audience-demo.sql';
import * as audienceGeoSql from '../audience-geo.sql';
import * as audienceInterestSql from '../audience-interest.sql';
import * as audienceVidViewsSql from '../audience-vid-views.sql';
import * as audienceSql from '../audience.sql';
import * as bioSql from '../bio.sql';
import * as campaignSql from '../campaign.sql';
import * as domainSql from '../domain.sql';
import * as eventReportSql from '../event-report.sql';
import * as eventSql from '../event.sql';
import * as externalWebsiteSql from '../external-website.sql';
import * as fileSql from '../file.sql';
import * as formResponseSql from '../form-response.sql';
import * as formSql from '../form.sql';
import * as genreSql from '../genre.sql';
import * as linkSql from '../link.sql';
import * as playlistCoverSql from '../playlist-cover.sql';
import * as playlistPitchReviewSql from '../playlist-pitch-review.sql';
import * as playlistPlacementSql from '../playlist-placement.sql';
import * as playlistSql from '../playlist.sql';
import * as providerAccountSql from '../provider-account.sql';
import * as providerSubAccountSql from '../provider-sub-account.sql';
import * as statSql from '../stat.sql';
import * as trackSql from '../track.sql';
import * as transactionSql from '../transaction.sql';
import * as userSessionSql from '../user-session.sql';
import * as userSql from '../user.sql';
import * as verificationTokenSql from '../verification-token.sql';
import * as vidRenderSql from '../vid-render.sql';
import * as visitorSessionSql from '../visitor-session.sql';
import * as workspaceSql from '../workspace.sql';

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
	...formSql,
	...formResponseSql,
	...genreSql,
	...linkSql,
	...playlistSql,
	...playlistCoverSql,
	...playlistPitchReviewSql,
	...playlistPlacementSql,
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

const polyscale = new Client('https://serverless.aws.psedge.global', {
	cacheId: 'polyscale-cache-id',
	username: 'target-db-username',
	password: 'target-db-password',
	database: 'target-db-database',
	provider: 'mysql',
});

neonConfig.fetchConnectionCache = true;

const write = neon(env.DATABASE_WRITE_URL);
const dbWrite = drizzleHttp(write, {
	schema: dbSchema,
});

const writePool = new Pool({ connectionString: env.DATABASE_WRITE_POOL_URL });
export const dbWritePool = drizzlePool(writePool, {
	schema: dbSchema,
});

const read = neon(env.DATABASE_READ_URL);
const dbRead = drizzleHttp(read, {
	schema: dbSchema,
});

const readPool = new Pool({ connectionString: env.DATABASE_READ_POOL_URL });
export const dbReadPool = drizzlePool(readPool, {
	schema: dbSchema,
});

export type DbHtml = typeof dbWrite;
export type DbHtmlTransaction = Parameters<Parameters<DbHtml['transaction']>[0]>[0];
export type DbPool = typeof dbWritePool;
export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];

export type Db = {
	write: DbHtml;
	writePool: DbPool;
	read: DbHtml;
	readPool: DbPool;
	closestRead?: DbHtml;
	closestReadPool?: DbPool;
	polyScale?: typeof polyscale;
};

export const db: Db = {
	write: dbWrite,
	writePool: dbWritePool,
	read: dbRead,
	readPool: dbReadPool,
};
