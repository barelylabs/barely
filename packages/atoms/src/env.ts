import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const atomsEnv = createEnv({
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
