import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const APPS = [
	'app',
	'bio',
	'cart',
	'manageEmail',
	'fm',
	'link',
	'page',
	'press',
	'sparrow',
	'www',
] as const;

export const authEnv = createEnv({
	server: {
		AUTH_SECRET:
			process.env.NODE_ENV === 'production' ?
				z.string().min(1)
			:	z.string().min(1).optional(),
		NODE_ENV: z.enum(['development', 'production']).optional(),
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
	},
	client: {
		NEXT_PUBLIC_APP_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_BIO_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_CART_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_FM_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_LINK_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_PAGE_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_PRESS_BASE_URL: z.string().optional(),
		NEXT_PUBLIC_WWW_BASE_URL: z.string().optional(),

		NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'production', 'preview']).optional(),
		NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
		NEXT_PUBLIC_CURRENT_APP: z.enum(APPS).optional(),
		NEXT_PUBLIC_APP_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_BIO_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_CART_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_FM_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_LINK_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_PAGE_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_PRESS_DEV_PORT: z.string().optional(),
		NEXT_PUBLIC_WWW_DEV_PORT: z.string().optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
		NEXT_PUBLIC_BIO_BASE_URL: process.env.NEXT_PUBLIC_BIO_BASE_URL,
		NEXT_PUBLIC_CART_BASE_URL: process.env.NEXT_PUBLIC_CART_BASE_URL,
		NEXT_PUBLIC_FM_BASE_URL: process.env.NEXT_PUBLIC_FM_BASE_URL,
		NEXT_PUBLIC_LINK_BASE_URL: process.env.NEXT_PUBLIC_LINK_BASE_URL,
		NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL: process.env.NEXT_PUBLIC_MANAGE_EMAIL_BASE_URL,
		NEXT_PUBLIC_PAGE_BASE_URL: process.env.NEXT_PUBLIC_PAGE_BASE_URL,
		NEXT_PUBLIC_PRESS_BASE_URL: process.env.NEXT_PUBLIC_PRESS_BASE_URL,
		NEXT_PUBLIC_WWW_BASE_URL: process.env.NEXT_PUBLIC_WWW_BASE_URL,

		NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
		NEXT_PUBLIC_CURRENT_APP: process.env.NEXT_PUBLIC_CURRENT_APP,
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_BIO_DEV_PORT: process.env.NEXT_PUBLIC_BIO_DEV_PORT,
		NEXT_PUBLIC_CART_DEV_PORT: process.env.NEXT_PUBLIC_CART_DEV_PORT,
		NEXT_PUBLIC_FM_DEV_PORT: process.env.NEXT_PUBLIC_FM_DEV_PORT,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT: process.env.NEXT_PUBLIC_MANAGE_EMAIL_DEV_PORT,
		NEXT_PUBLIC_PAGE_DEV_PORT: process.env.NEXT_PUBLIC_PAGE_DEV_PORT,
		NEXT_PUBLIC_PRESS_DEV_PORT: process.env.NEXT_PUBLIC_PRESS_DEV_PORT,
		NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
	},
	skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
});
