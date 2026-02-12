import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// When skipping validation (e.g., in tests), provide mock values
const isTestEnv = !!process.env.SKIP_ENV_VALIDATION;

export const dbEnv =
	isTestEnv ?
		{
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
			DATABASE_POOL_URL: 'postgresql://test:test@localhost:5432/test',
			UPSTASH_REDIS_REST_URL: 'https://test-redis.upstash.io',
			UPSTASH_REDIS_REST_TOKEN: 'test-redis-token',
		}
	:	createEnv({
			server: {
				DATABASE_URL: z.url(),
				DATABASE_POOL_URL: z.url(),
				UPSTASH_REDIS_REST_URL: z.url(),
				UPSTASH_REDIS_REST_TOKEN: z.string(),
			},
			experimental__runtimeEnv: {},
		});
