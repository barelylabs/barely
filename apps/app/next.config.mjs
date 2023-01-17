/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: [
		'@barely/api',
		'@barely/auth',
		'@barely/config',
		'@barely/db',
		'@barely/schema',
		'@barely/spotify',
		'@barely/utils',
	],
	experimental: {
		appDir: true,
	},
};

export default config;
