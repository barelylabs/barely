import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DATABASE_POOL_URL: z.url(),
	},
	experimental__runtimeEnv: {},
});
