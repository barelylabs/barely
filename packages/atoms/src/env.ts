import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// When skipping validation (e.g., in tests), provide mock values
const isTestEnv = !!process.env.SKIP_ENV_VALIDATION;

export const atomsEnv =
	isTestEnv ?
		{
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
			DATABASE_POOL_URL: 'postgresql://test:test@localhost:5432/test',
			NEXT_PUBLIC_PUSHER_APP_KEY: 'test-pusher-key',
			NEXT_PUBLIC_PUSHER_APP_CLUSTER: 'test-cluster',
		}
	:	createEnv({
			server: {
				DATABASE_URL: z.url(),
				DATABASE_POOL_URL: z.url(),
			},
			client: {
				NEXT_PUBLIC_PUSHER_APP_KEY: z.string(),
				NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string(),
			},
			experimental__runtimeEnv: {
				NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
				NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
			},
		});
