import { APPS } from '@barely/const';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

import { authEnv } from '@barely/auth/env';

type RateLimitTime =
	| `${number} ms`
	| `${number} s`
	| `${number} m`
	| `${number} h`
	| `${number} d`;

const devPortSchema = z
	.string()
	.optional()
	.refine(v => process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development' || !!v, {
		// .refine(v => !isDevelopment() || !!v, {
		message: 'You need a dev port in order to run the app locally',
	});

const rateLimitSchema = z
	.string()
	.refine(
		v => {
			const isValid = /^\d+\s[msdh](s)?$/i.test(v);
			return isValid;
		},
		{
			message: 'Rate limit must be in the format: {number} {ms|s|m|h|d|ms}',
		},
	)
	.transform(v => {
		return v as RateLimitTime;
	})
	.optional()
	.default('1 h');

export const libEnv = createEnv({
	extends: [authEnv],
	server: {
		ANTHROPIC_API_KEY: z.string(),
		AUTH_SECRET: z.string(),
		AWS_S3_BUCKET_NAME: z.string(),
		AWS_S3_REGION: z.string(),
		AWS_S3_ACCESS_KEY_ID: z.string(),
		AWS_S3_SECRET_ACCESS_KEY: z.string(),
		BARELY_SLACK_HOOK_ALERTS: z.url().optional(),
		BARELY_SLACK_HOOK_ERRORS: z.url().optional(),
		BARELY_SLACK_HOOK_SALES: z.url().optional(),
		BARELY_SLACK_HOOK_USERS: z.url().optional(),
		BARELY_SLACK_HOOK_LOGS: z.url().optional(),
		BARELY_SLACK_NOTIFY_USER: z.string().optional(),
		BOT_SPOTIFY_ACCOUNT_ID: z.string(),
		BOT_THREADS_API_KEY: z.string(),
		DATABASE_URL: z.url(),
		DATABASE_POOL_URL: z.url(),
		EASYPOST_API_KEY: z.string(),
		GANDI_API_KEY: z.string(),
		INTERNAL_PDF_SECRET: z.string(),
		LOCALHOST_IP: z.string(),
		MAILCHIMP_CLIENT_ID: z.string(),
		MAILCHIMP_CLIENT_SECRET: z.string(),
		META_PIXEL_ID_NYC: z.string(),
		META_PIXEL_ACCESS_TOKEN_NYC: z.string(), // Required for server-side Conversions API
		META_TEST_EVENT_CODE: z.string().optional(),
		NEXTAUTH_SECRET: z.string(),
		OPENAI_API_KEY: z.string(),
		OPENAI_ORG_ID: z.string(),
		PLATFORM_INVOICE_FEE_PERCENTAGE: z.coerce.number().min(0).max(100).default(0.5), // Default 0.5%
		PUSHER_APP_SECRET: z.string(),
		RATE_LIMIT_RECORD_CART_EVENT: rateLimitSchema,
		RATE_LIMIT_RECORD_LINK_CLICK: rateLimitSchema,
		RESEND_API_KEY: z.string(),
		SCREENING_PHONE_NUMBER: z.string(),
		SHIPENGINE_API_KEY: z.string(),
		SHIPSTATION_API_KEY_US: z.string(),
		SHIPSTATION_API_KEY_UK: z.string(),
		SPOTIFY_CLIENT_ID: z.string(),
		SPOTIFY_CLIENT_SECRET: z.string(),
		STRIPE_SECRET_KEY: z.string(),
		TIKTOK_CLIENT_KEY: z.string(),
		TIKTOK_CLIENT_SECRET: z.string(),
		TINYBIRD_API_KEY: z.string(),
		TWILIO_ACCOUNT_SID: z.string(),
		TWILIO_AUTH_TOKEN: z.string(),
		TWILIO_PHONE_NUMBER: z.string(),
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),
		VERCEL_LINK_PROJECT_ID: z.string(),
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
		VERCEL_TEAM_ID: z.string(),
		VERCEL_TOKEN: z.string(),
	},
	client: {
		NEXT_PUBLIC_APP_BASE_URL: z.string(),
		NEXT_PUBLIC_APP_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN: z.string(),
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
		NEXT_PUBLIC_NYC_BASE_URL: z.string(),
		NEXT_PUBLIC_NYC_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
		NEXT_PUBLIC_PUSHER_APP_KEY: z.string(),
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string(),
		NEXT_PUBLIC_S3_BUCKET_NAME: z.string(),
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
		NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']),
		NEXT_PUBLIC_VIP_BASE_URL: z.string(),
		NEXT_PUBLIC_VIP_DEV_PORT: devPortSchema,
		NEXT_PUBLIC_WWW_BASE_URL: z.string(),
		NEXT_PUBLIC_WWW_DEV_PORT: devPortSchema,
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN: process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN,
		NEXT_PUBLIC_BIO_BASE_URL: process.env.NEXT_PUBLIC_BIO_BASE_URL,
		NEXT_PUBLIC_BIO_DEV_PORT: process.env.NEXT_PUBLIC_BIO_DEV_PORT,
		NEXT_PUBLIC_CART_BASE_URL: process.env.NEXT_PUBLIC_CART_BASE_URL,
		NEXT_PUBLIC_CART_DEV_PORT: process.env.NEXT_PUBLIC_CART_DEV_PORT,
		NEXT_PUBLIC_FM_BASE_URL: process.env.NEXT_PUBLIC_FM_BASE_URL,
		NEXT_PUBLIC_FM_DEV_PORT: process.env.NEXT_PUBLIC_FM_DEV_PORT,
		NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: process.env.NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL,
		NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: process.env.NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT,
		NEXT_PUBLIC_NYC_BASE_URL: process.env.NEXT_PUBLIC_NYC_BASE_URL,
		NEXT_PUBLIC_NYC_DEV_PORT: process.env.NEXT_PUBLIC_NYC_DEV_PORT,
		NEXT_PUBLIC_PAGE_BASE_URL: process.env.NEXT_PUBLIC_PAGE_BASE_URL,
		NEXT_PUBLIC_PAGE_DEV_PORT: process.env.NEXT_PUBLIC_PAGE_DEV_PORT,
		NEXT_PUBLIC_PRESS_BASE_URL: process.env.NEXT_PUBLIC_PRESS_BASE_URL,
		NEXT_PUBLIC_PRESS_DEV_PORT: process.env.NEXT_PUBLIC_PRESS_DEV_PORT,
		NEXT_PUBLIC_CURRENT_APP: process.env.NEXT_PUBLIC_CURRENT_APP,
		NEXT_PUBLIC_LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
		NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_VIP_BASE_URL: process.env.NEXT_PUBLIC_VIP_BASE_URL,
		NEXT_PUBLIC_VIP_DEV_PORT: process.env.NEXT_PUBLIC_VIP_DEV_PORT,
		NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,
		NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
	},
	onValidationError: issues => {
		console.error('❌ Invalid environment variables:', issues);
		throw new Error('Invalid environment variables');
	},
	skipValidation:
		!!process.env.SKIP_ENV_VALIDATION ||
		process.env.npm_lifecycle_event === 'lint' ||
		process.env.npm_lifecycle_event === 'test',
});
