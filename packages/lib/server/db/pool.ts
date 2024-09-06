import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import { dbSchema } from '.';
import { env } from '../../env';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
export const dbPool = drizzlePool(pool, {
	schema: dbSchema,
});

export type DbPool = typeof dbPool;
export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];
