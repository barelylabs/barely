import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const dbEnv = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DATABASE_POOL_URL: z.url(),
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),
	},
	experimental__runtimeEnv: {},
});
