import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import { dbSchema } from './client';

neonConfig.webSocketConstructor = ws;
// const pool = new Pool({ connectionString: process.env.DATABASE_POOL_URL });
// export const _dbPool = drizzlePool(pool, {
// 	schema: dbSchema,
// });

export type DbPool = ReturnType<typeof drizzlePool>;
export type DbPoolTransaction = Parameters<Parameters<DbPool['transaction']>[0]>[0];

export const makePool = () =>
	new Pool({ connectionString: process.env.DATABASE_POOL_URL });

// trying to make this a singleton. Running into issues passing the db into trpc context,
// so we're going to make it a global variable.
// export let neonPool: ReturnType<typeof makePool> | undefined = undefined;
export type NeonPool = ReturnType<typeof makePool>;

// export const getPool = () => {
// 	if (neonPool) return neonPool;

// 	console.log('making db pool');
// 	return (neonPool = makePool());
// };

export const dbPool = (pool: ReturnType<typeof makePool>) =>
	drizzlePool(pool, {
		schema: dbSchema,
	});
