import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ['@barely/db', '@barely/config', '@barely/lib', '@barely/ui'],
	experimental: {
		appDir: true,
	},
	redirects: async () => {
		return [
			{
				source: '/',
				destination: '/link',
				permanent: false,
			},
		];
	},
	env: {
		NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
		NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
		NEXT_PUBLIC_WEB_DEV_PORT: process.env.NEXT_PUBLIC_WEB_DEV_PORT,

		DATABASE_URL: process.env.DATABASE_URL,
		VERCEL_ENV: process.env.VERCEL_ENV,
		VERCEL_URL: process.env.VERCEL_URL,
	},
};

export default config;
