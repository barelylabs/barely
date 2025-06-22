import { env as libEnv } from '@barely/lib/env';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
	extends: [libEnv],
	server: {
		RESEND_WEBHOOK_SECRET: z.string(),
		STRIPE_WEBHOOK_SECRET: z.string(),
		STRIPE_CONNECT_WEBHOOK_SECRET: z.string(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_BIO_BASE_URL: process.env.NEXT_PUBLIC_BIO_BASE_URL,
		NEXT_PUBLIC_BIO_DEV_PORT: process.env.NEXT_PUBLIC_BIO_DEV_PORT,
		NEXT_PUBLIC_CART_BASE_URL: process.env.NEXT_PUBLIC_CART_BASE_URL,
		NEXT_PUBLIC_CART_DEV_PORT: process.env.NEXT_PUBLIC_CART_DEV_PORT,
		NEXT_PUBLIC_PRESS_BASE_URL: process.env.NEXT_PUBLIC_PRESS_BASE_URL,
		NEXT_PUBLIC_PRESS_DEV_PORT: process.env.NEXT_PUBLIC_PRESS_DEV_PORT,
		NEXT_PUBLIC_CURRENT_APP: process.env.NEXT_PUBLIC_CURRENT_APP,
		NEXT_PUBLIC_LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
		NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,
		NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
	},
	skipValidation:
		// !!process.env.CI || <- It seems like this isn't what we want?
		!!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'lint',
});
