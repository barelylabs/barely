import { APPS } from '@barely/const';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// When skipping validation (e.g., in tests), provide mock values
const isTestEnv = !!process.env.SKIP_ENV_VALIDATION;

const devPortSchema = z
	.string()
	.optional()
	.refine(v => process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development' || !!v, {
		// .refine(v => !isDevelopment() || !!v, {
		message: 'You need a dev port in order to run the app locally',
	});

export const utilsEnv =
	isTestEnv ?
		{
			BARELY_SLACK_HOOK_ALERTS: 'https://hooks.slack.com/test/alerts',
			BARELY_SLACK_HOOK_ERRORS: 'https://hooks.slack.com/test/errors',
			BARELY_SLACK_HOOK_LOGS: 'https://hooks.slack.com/test/logs',
			BARELY_SLACK_HOOK_SALES: 'https://hooks.slack.com/test/sales',
			BARELY_SLACK_HOOK_USERS: 'https://hooks.slack.com/test/users',
			BARELY_SLACK_NOTIFY_USER: undefined,
			DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
			DATABASE_POOL_URL: 'postgresql://test:test@localhost:5432/test',
			LOCALHOST_IP: '127.0.0.1',
			TWILIO_ACCOUNT_SID: 'test-twilio-sid',
			TWILIO_AUTH_TOKEN: 'test-twilio-token',
			TWILIO_PHONE_NUMBER: '+15555555555',
			NEXT_PUBLIC_APP_BASE_URL: 'http://localhost:3000',
			NEXT_PUBLIC_APP_DEV_PORT: '3000',
			NEXT_PUBLIC_BIO_BASE_URL: 'http://localhost:3007',
			NEXT_PUBLIC_BIO_DEV_PORT: '3007',
			NEXT_PUBLIC_CART_BASE_URL: 'http://localhost:3001',
			NEXT_PUBLIC_CART_DEV_PORT: '3001',
			NEXT_PUBLIC_FM_BASE_URL: 'http://localhost:3002',
			NEXT_PUBLIC_FM_DEV_PORT: '3002',
			NEXT_PUBLIC_PAGE_BASE_URL: 'http://localhost:3004',
			NEXT_PUBLIC_PAGE_DEV_PORT: '3004',
			NEXT_PUBLIC_PRESS_BASE_URL: 'http://localhost:3005',
			NEXT_PUBLIC_PRESS_DEV_PORT: '3005',
			NEXT_PUBLIC_CURRENT_APP: 'app' as const,
			NEXT_PUBLIC_LINK_BASE_URL: 'http://localhost:3003',
			NEXT_PUBLIC_LINK_DEV_PORT: '3003',
			NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: '3008',
			NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: 'http://localhost:3008',
			NEXT_PUBLIC_PUSHER_APP_ID: 'test-pusher-id',
			NEXT_PUBLIC_PUSHER_APP_KEY: 'test-pusher-key',
			NEXT_PUBLIC_PUSHER_APP_CLUSTER: 'test-cluster',
			NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_test',
			NEXT_PUBLIC_VERCEL_ENV: 'development' as const,
			NEXT_PUBLIC_WWW_BASE_URL: 'http://localhost:3006',
			NEXT_PUBLIC_WWW_DEV_PORT: '3006',
		}
	:	createEnv({
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
				NEXT_PUBLIC_VERCEL_ENV: z.enum([
					'development',
					'preview',
					'production',
					'staging',
				]),
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
				NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
					process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
				NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
				NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,
				NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
			},
		});
