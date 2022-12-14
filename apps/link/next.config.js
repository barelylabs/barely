module.exports = {
	reactStrictMode: true,
	experimental: {
		appDir: true,
		transpilePackages: [
			'@barely/api',
			'@barely/auth',
			'@barely/db',
			'@barely/edge',
			'@barely/eslint-config',
			'@barely/tailwind-config',
			'@barely/ts-config',
			'@barely/ui',
			'@barely/zod',
		],
	},
};
