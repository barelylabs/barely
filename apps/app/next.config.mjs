import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	images: {
		minimumCacheTTL: 60,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				pathname: '/image/*',
			},
			{
				protocol: 'https',
				hostname: 'mosaic.scdn.co',
				pathname: '/**',
			},
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	transpilePackages: [
		'@barely/config',
		'@barely/db',
		'@barely/env',
		'@barely/email',
		'@barely/lib',
		'@barely/toast',
		'@barely/ui',
	],
	experimental: {
		appDir: true,
		// swcPlugins: [['@swc-jotai/react-refresh', {}]],
		swcPlugins: [
			['next-superjson-plugin', {}],
			// ['@swc-jotai/react-refresh', {}],
		],
	},
	env: {
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_WEB_DEV_PORT: process.env.NEXT_PUBLIC_WEB_DEV_PORT,
		NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
		NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
		NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,

		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

		BOT_SPOTIFY_ACCOUNT_ID: process.env.BOT_SPOTIFY_ACCOUNT_ID,
		DATABASE_URL: process.env.DATABASE_URL,
		DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
		SCREENING_PHONE_NUMBER: process.env.SCREENING_PHONE_NUMBER,
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
		STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
		STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
		TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
		POSTMARK_SERVER_API_TOKEN: process.env.POSTMARK_SERVER_API_TOKEN,
		TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
		TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
		VERCEL_ENV: process.env.VERCEL_ENV,
	},
};

export default config;
