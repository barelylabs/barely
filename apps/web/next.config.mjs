import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: [
		'@barely/api',
		'@barely/auth',
		'@barely/db',
		'@barely/edge',
		'@barely/meta',
		'@barely/config',
		'@barely/schema',
		'@barely/ui',
		'@barely/utils',
	],
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
