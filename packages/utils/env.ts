import { APPS } from '@barely/const';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const devPortSchema = z
	.string()
	.optional()
	.refine(v => process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development' || !!v, {
		// .refine(v => !isDevelopment() || !!v, {
		message: 'You need a dev port in order to run the app locally',
	});

export const utilsEnv = createEnv({
	server: {
		BARELY_SLACK_HOOK_ALERTS: z.string(),
		BARELY_SLACK_HOOK_ERRORS: z.string(),
		BARELY_SLACK_HOOK_LOGS: z.string(),
		BARELY_SLACK_HOOK_SALES: z.string(),
		BARELY_SLACK_HOOK_USERS: z.string(),
		BARELY_SLACK_NOTIFY_USER: z.string().optional(),
		DATABASE_URL: z.url(),
		DATABASE_POOL_URL: z.url(),
		LOCALHOST_IP: z.string(),
		TWILIO_ACCOUNT_SID: z.string(),
		TWILIO_AUTH_TOKEN: z.string(),
		TWILIO_PHONE_NUMBER: z.string(),
	},
	client: {
		NEXT_PUBLIC_APP_BASE_URL: z.string(),
		NEXT_PUBLIC_APP_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_BIO_BASE_URL: z.string(),
		NEXT_PUBLIC_BIO_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_CART_BASE_URL: z.string(),
		NEXT_PUBLIC_CART_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_FM_BASE_URL: z.string(),
		NEXT_PUBLIC_FM_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_PAGE_BASE_URL: z.string(),
		NEXT_PUBLIC_PAGE_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_PRESS_BASE_URL: z.string(),
		NEXT_PUBLIC_PRESS_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_CURRENT_APP: z.enum(APPS),
		NEXT_PUBLIC_LINK_BASE_URL: z.string(),
		NEXT_PUBLIC_LINK_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: z.string(),
		NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
		NEXT_PUBLIC_PUSHER_APP_KEY: z.string(),
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string(),
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']),
		NEXT_PUBLIC_WWW_BASE_URL: z.string(),
		NEXT_PUBLIC_WWW_DEV_PORT: devPortSchema,
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_CURRENT_APP: process.env.NEXT_PUBLIC_CURRENT_APP,
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BIO_BASE_URL: process.env.NEXT_PUBLIC_BIO_BASE_URL,
		NEXT_PUBLIC_BIO_DEV_PORT: process.env.NEXT_PUBLIC_BIO_DEV_PORT,
		NEXT_PUBLIC_CART_BASE_URL: process.env.NEXT_PUBLIC_CART_BASE_URL,
		NEXT_PUBLIC_CART_DEV_PORT: process.env.NEXT_PUBLIC_CART_DEV_PORT,
		NEXT_PUBLIC_FM_BASE_URL: process.env.NEXT_PUBLIC_FM_BASE_URL,
		NEXT_PUBLIC_FM_DEV_PORT: process.env.NEXT_PUBLIC_FM_DEV_PORT,
		NEXT_PUBLIC_PAGE_BASE_URL: process.env.NEXT_PUBLIC_PAGE_BASE_URL,
		NEXT_PUBLIC_PAGE_DEV_PORT: process.env.NEXT_PUBLIC_PAGE_DEV_PORT,
		NEXT_PUBLIC_PRESS_BASE_URL: process.env.NEXT_PUBLIC_PRESS_BASE_URL,
		NEXT_PUBLIC_PRESS_DEV_PORT: process.env.NEXT_PUBLIC_PRESS_DEV_PORT,
		NEXT_PUBLIC_LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: process.env.NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL,
		NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: process.env.NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT,
		NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
		NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,
		NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
	},
});
