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
		],
	},

	async redirects() {
		return [
			{
				source: '/services/fulfillment',
				destination: '/services/fulfilled',
				permanent: true,
			},
			{
				source: '/cal',
				destination: 'https://cal.com/barely/nyc',
				permanent: true,
			},
			{
				source: '/cal/onboarding',
				destination: 'https://cal.com/barely/onboarding',
				permanent: true,
			},
			{
				source: '/cal/coaching',
				destination: 'https://cal.com/barely/coaching',
				permanent: true,
			},
			{
				source: '/cal/coaching-ad-hoc',
				destination: 'https://cal.com/barely/coaching-ad-hoc',
				permanent: true,
			},
			{
				source: '/cal/preferred',
				destination: 'https://cal.com/barely/preferred',
				permanent: true,
			},
			{
				source: '/cal/proposal',
				destination: 'https://cal.com/barely/proposal',
				permanent: true,
			},
			{
				source: '/cal/monthly',
				destination: 'https://cal.com/barely/monthly',
				permanent: true,
			},
			// Service short-URL redirects
			{
				source: '/bedroom',
				destination: '/services/bedroom',
				permanent: true,
			},
			{
				source: '/breakout',
				destination: '/services/breakout',
				permanent: true,
			},
			{
				source: '/fulfilled',
				destination: '/services/fulfilled',
				permanent: true,
			},
			{
				source: '/labels',
				destination: '/services/labels',
				permanent: true,
			},
			{
				source: '/rising',
				destination: '/services/rising',
				permanent: true,
			},
			{
				source: '/stan',
				destination: '/services/stan',
				permanent: true,
			},
			{
				source: '/swarm',
				destination: '/services/swarm',
				permanent: true,
			},
		];
	},

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	transpilePackages: ['@barely/db', '@barely/config', '@barely/lib', '@barely/ui'],
};

export default config;
