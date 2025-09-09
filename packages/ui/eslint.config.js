import baseConfig from '@barely/eslint-config/base';
import reactConfig from '@barely/eslint-config/react';
import * as tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, ...reactConfig, {
	languageOptions: {
		parserOptions: {
			project: './tsconfig.json',
			tsconfigRootDir: import.meta.dirname,
		},
	},
});
