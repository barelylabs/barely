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
		],
	},

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	/** Enables hot reloading for local packages without a build step */
	transpilePackages: ['@barely/email', '@barely/env', '@barely/lib', '@barely/ui'],

	experimental: {},
};

export default config;
