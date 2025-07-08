import baseConfig from '@barely/eslint-config/base';
import * as tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, {
	languageOptions: {
		parserOptions: {
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
		},
	},
});
