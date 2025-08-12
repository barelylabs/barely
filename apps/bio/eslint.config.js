import baseConfig, { restrictEnvAccess } from '@barely/eslint-config/base';
import nextjsConfig from '@barely/eslint-config/nextjs';
import reactConfig from '@barely/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [
	{
		ignores: ['.next/**'],
	},
	...baseConfig,
	...reactConfig,
	...nextjsConfig,
	...restrictEnvAccess,
];
