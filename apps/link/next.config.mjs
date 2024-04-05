import { fileURLToPath } from 'url';
import createJITI from 'jiti';

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJITI(fileURLToPath(import.meta.url))('./src/env');

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	typescript: { ignoreBuildErrors: true },
	eslint: { ignoreDuringBuilds: true },

	/** Enables hot reloading for local packages without a build step */
	transpilePackages: ['@barely/config', '@barely/env', '@barely/lib', '@barely/ui'],
};

export default config;
