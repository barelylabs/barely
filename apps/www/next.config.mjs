import { fileURLToPath } from 'url';
import createJITI from 'jiti';

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJITI(fileURLToPath(import.meta.url))('./src/env');

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	transpilePackages: ['@barely/db', '@barely/config', '@barely/lib', '@barely/ui'],
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
