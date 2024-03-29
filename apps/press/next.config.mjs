// import * as dotenv from 'dotenv';

// dotenv.config({ path: '../../.env' });

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
		],
	},

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	transpilePackages: ['@barely/db', '@barely/config', '@barely/lib', '@barely/ui'],
};

export default config;
