import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ['@barely/config', '@barely/db', '@barely/lib', '@barely/ui'],
	env: {
		VISITOR_IP: process.env.VISITOR_IP,
		VISITOR_UA: process.env.VISITOR_UA,
		US_EAST_1_HOSTNAME: process.env.US_EAST_1_HOSTNAME,
		US_EAST_1_USERNAME: process.env.US_EAST_1_USERNAME,
		US_EAST_1_PASSWORD: process.env.US_EAST_1_PASSWORD,
		US_WEST_1_HOSTNAME: process.env.US_WEST_1_HOSTNAME,
		US_WEST_1_USERNAME: process.env.US_WEST_1_USERNAME,
		US_WEST_1_PASSWORD: process.env.US_WEST_1_PASSWORD,
		US_WEST_2_HOSTNAME: process.env.US_WEST_2_HOSTNAME,
		US_WEST_2_USERNAME: process.env.US_WEST_2_USERNAME,
		US_WEST_2_PASSWORD: process.env.US_WEST_2_PASSWORD,
		AP_NORTHEAST_1_HOSTNAME: process.env.AP_NORTHEAST_1_HOSTNAME,
		AP_NORTHEAST_1_USERNAME: process.env.AP_NORTHEAST_1_USERNAME,
		AP_NORTHEAST_1_PASSWORD: process.env.AP_NORTHEAST_1_PASSWORD,
		AP_SOUTHEAST_1_HOSTNAME: process.env.AP_SOUTHEAST_1_HOSTNAME,
		AP_SOUTHEAST_1_USERNAME: process.env.AP_SOUTHEAST_1_USERNAME,
		AP_SOUTHEAST_1_PASSWORD: process.env.AP_SOUTHEAST_1_PASSWORD,
		AP_SOUTHEAST_2_HOSTNAME: process.env.AP_SOUTHEAST_2_HOSTNAME,
		AP_SOUTHEAST_2_USERNAME: process.env.AP_SOUTHEAST_2_USERNAME,
		AP_SOUTHEAST_2_PASSWORD: process.env.AP_SOUTHEAST_2_PASSWORD,
		AP_SOUTH_1_HOSTNAME: process.env.AP_SOUTH_1_HOSTNAME,
		AP_SOUTH_1_USERNAME: process.env.AP_SOUTH_1_USERNAME,
		AP_SOUTH_1_PASSWORD: process.env.AP_SOUTH_1_PASSWORD,
		SA_EAST_1_HOSTNAME: process.env.SA_EAST_1_HOSTNAME,
		SA_EAST_1_USERNAME: process.env.SA_EAST_1_USERNAME,
		SA_EAST_1_PASSWORD: process.env.SA_EAST_1_PASSWORD,
	},
	experimental: {
		appDir: true,
	},
};

export default config;
