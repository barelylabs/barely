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
};

export default config;
