import { fileURLToPath } from 'url';
import createJITI from 'jiti';

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJITI(fileURLToPath(import.meta.url))('./src/env');

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	devIndicators: false,

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
			{
				protocol: 'https',
				hostname: 'images-ak.spotifycdn.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'barely-ugc.s3.amazonaws.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'd1a1q5eibbdlen.cloudfront.net',
				pathname: '/**',
			},
		],
	},

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	transpilePackages: ['@barely/db', '@barely/config', '@barely/lib', '@barely/ui'],
};

export default config;
