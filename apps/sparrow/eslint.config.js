import baseConfig, { restrictEnvAccess } from '@barely/eslint-config/base';
import nextConfig from '@barely/eslint-config/nextjs';
import reactConfig from '@barely/eslint-config/react';
import * as tseslint from 'typescript-eslint';

export default tseslint.config(
	...baseConfig,
	...reactConfig,
	...nextConfig,
	...restrictEnvAccess,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
);
