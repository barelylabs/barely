/** @type {import("eslint").Linter.Config} */
const config = {
	extends: ['next', 'turbo', 'prettier'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		'react/jsx-key': 'off',
	},
	overrides: [
		{
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
			files: ['**/*.ts', '**/*.tsx'],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: [
					'./apps/*/tsconfig.json',
					'./libs/*/tsconfig.json',
					'./packages/*/tsconfig.json',
				],
			},
			rules: {
				'@typescript-eslint/no-misused-promises': [
					2,
					{ checksVoidReturn: { attributes: false } },
				],
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': ['off'],
			},
		},
	],
	root: true,
	reportUnusedDisableDirectives: true,
	ignorePatterns: [
		'.eslintrc.js',
		'**/*.config.js',
		'**/*.config.cjs',
		'packages/config/**',
	],
};

module.exports = config;
