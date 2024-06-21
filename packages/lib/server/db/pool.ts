import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { dbSchema } from '.';
import { env } from '../../env';

const pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
const dbPool = drizzle(pool, {
	schema: dbSchema,
});

export type DbPool = typeof dbPool;
export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];
