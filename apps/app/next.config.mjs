import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: [
		'@barely/api',
		'@barely/config',
		'@barely/db',
		'@barely/env',
		'@barely/schema',
		'@barely/spotify',
		'@barely/ui',
		'@barely/utils',
	],
	experimental: {
		appDir: true,
	},
};

export default config;
