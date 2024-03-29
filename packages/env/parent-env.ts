import { z } from 'zod';

export const processEnv = {
	// VARIABLES
	RATE_LIMIT_RECORD_LINK_CLICK: process.env.RATE_LIMIT_RECORD_LINK_CLICK,

	/**
	 * We have to destructure all variables from process.env to keep from tree-shaking them away 🤦‍♂️
	 * */

	/**
	 * CLIENT
	 * */
	NEXT_PUBLIC_CURRENT_APP: process.env.NEXT_PUBLIC_CURRENT_APP,

	// APP
	NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
	NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,

	// BIO
	NEXT_PUBLIC_BIO_BASE_URL: process.env.NEXT_PUBLIC_BIO_BASE_URL,
	NEXT_PUBLIC_BIO_DEV_PORT: process.env.NEXT_PUBLIC_BIO_DEV_PORT,

	// CART
	NEXT_PUBLIC_CART_BASE_URL: process.env.NEXT_PUBLIC_CART_BASE_URL,
	NEXT_PUBLIC_CART_DEV_PORT: process.env.NEXT_PUBLIC_CART_DEV_PORT,

	// LINK
	NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
	NEXT_PUBLIC_LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL,
	NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN:
		process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN,
	NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN: process.env.NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN,

	// PRESS
	NEXT_PUBLIC_PRESS_BASE_URL: process.env.NEXT_PUBLIC_PRESS_BASE_URL,
	NEXT_PUBLIC_PRESS_DEV_PORT: process.env.NEXT_PUBLIC_PRESS_DEV_PORT,

	// WWW
	NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
	NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,

	// CLOUDINARY
	NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
	NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

	// STRIPE
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

	// PUSHER
	NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
	NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
	NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,

	// VERCEL
	NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
	NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,

	/**
	 * SERVER
	 * */
	AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
	// AWS_S3_CALLBACK_URL: process.env.AWS_S3_CALLBACK_URL,
	AWS_S3_REGION: process.env.AWS_S3_REGION,
	AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
	AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
	BOT_SPOTIFY_ACCOUNT_ID: process.env.BOT_SPOTIFY_ACCOUNT_ID,
	BOT_THREADS_API_KEY: process.env.BOT_THREADS_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
	DATABASE_URL: process.env.DATABASE_URL,
	DATABASE_POOL_URL: process.env.DATABASE_POOL_URL,
	EASYPOST_API_KEY: process.env.EASYPOST_API_KEY,
	GANDI_API_KEY: process.env.GANDI_API_KEY,
	LOCALHOST_IP: process.env.LOCALHOST_IP,
	META_TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
	POSTMARK_SERVER_API_TOKEN: process.env.POSTMARK_SERVER_API_TOKEN,
	PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
	RESEND_API_KEY: process.env.RESEND_API_KEY,
	SCREENING_PHONE_NUMBER: process.env.SCREENING_PHONE_NUMBER,
	SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
	SHIPENGINE_API_KEY: process.env.SHIPENGINE_API_KEY,
	SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
	STRIPE_CONNECT_WEBHOOK_SECRET: process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
	TINYBIRD_API_KEY: process.env.TINYBIRD_API_KEY,
	TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
	TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	VERCEL_ENV: process.env.VERCEL_ENV,
	VERCEL_LINK_PROJECT_ID: process.env.VERCEL_LINK_PROJECT_ID,
	VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
	VERCEL_TOKEN: process.env.VERCEL_TOKEN,
	VERCEL_URL: process.env.VERCEL_URL,
};

export const clientEnvSchema = z.object({
	NEXT_PUBLIC_CURRENT_APP: z.enum(['app', 'link', 'www', 'bio', 'press']),
	NEXT_PUBLIC_APP_BASE_URL: z.string(),
	NEXT_PUBLIC_APP_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),
	NEXT_PUBLIC_BIO_BASE_URL: z.string(),
	NEXT_PUBLIC_BIO_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),

	NEXT_PUBLIC_CART_BASE_URL: z.string(),
	NEXT_PUBLIC_CART_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),

	NEXT_PUBLIC_LINK_BASE_URL: z.string(),
	NEXT_PUBLIC_LINK_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),

	NEXT_PUBLIC_PRESS_BASE_URL: z.string(),
	NEXT_PUBLIC_PRESS_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),

	NEXT_PUBLIC_WWW_BASE_URL: z.string(),
	NEXT_PUBLIC_WWW_DEV_PORT: z
		.string()
		.optional()
		.refine(v => process.env.VERCEL_ENV !== 'development' || !!v, {
			message: 'You need a dev port in order to run the app locally',
		}),

	NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN: z.string(),
	NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN: z.string(),
	NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string(),
	NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
	NEXT_PUBLIC_PUSHER_APP_KEY: z.string(),
	NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string(),
	NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
	NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']),
});

type RateLimitTime =
	| `${number} ms`
	| `${number} s`
	| `${number} m`
	| `${number} h`
	| `${number} d`;

export const serverEnvSchema = z.object({
	AWS_S3_BUCKET_NAME: z.string(),
	// AWS_S3_CALLBACK_URL: z.string(),
	AWS_S3_REGION: z.string(),
	AWS_S3_ACCESS_KEY_ID: z.string(),
	AWS_S3_SECRET_ACCESS_KEY: z.string(),
	BOT_SPOTIFY_ACCOUNT_ID: z.string(),
	BOT_THREADS_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
	DATABASE_URL: z.string(),
	DATABASE_POOL_URL: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	EASYPOST_API_KEY: z.string().optional(),
	LOCALHOST_IP: z.string(),
	GANDI_API_KEY: z.string(),
	META_TEST_EVENT_CODE: z.string().optional(),
	NEXTAUTH_SECRET: z.string(),
	OPENAI_API_KEY: z.string(),
	OPENAI_ORG_ID: z.string(),
	POSTMARK_SERVER_API_TOKEN: z.string(),
	PUSHER_APP_SECRET: z.string(),
	RATE_LIMIT_RECORD_LINK_CLICK: z
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
		.default('1 h'),
	RESEND_API_KEY: z.string().optional(),
	SCREENING_PHONE_NUMBER: z.string(),
	SENDGRID_API_KEY: z.string(),
	SHIPENGINE_API_KEY: z.string(),
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string(),
	STRIPE_SECRET_KEY: z.string(),
	STRIPE_WEBHOOK_SECRET: z.string(),
	STRIPE_CONNECT_WEBHOOK_SECRET: z.string(),
	TINYBIRD_API_KEY: z.string(),
	TWILIO_ACCOUNT_SID: z.string(),
	TWILIO_AUTH_TOKEN: z.string(),
	TWILIO_PHONE_NUMBER: z.string(),
	UPSTASH_REDIS_REST_URL: z.string().url(),
	UPSTASH_REDIS_REST_TOKEN: z.string(),
	VERCEL_ENV: z.enum(['development', 'preview', 'production']),
	VERCEL_LINK_PROJECT_ID: z.string(),
	VERCEL_TEAM_ID: z.string(),
	VERCEL_TOKEN: z.string(),
});
