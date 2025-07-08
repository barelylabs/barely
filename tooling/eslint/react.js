import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'jsx-a11y': jsxA11yPlugin,
		},
		rules: {
			...reactPlugin.configs['jsx-runtime'].rules,
			...reactHooksPlugin.configs.recommended.rules,
			'@typescript-eslint/no-empty-interface': 'off',
		},
		languageOptions: {
			globals: {
				React: 'writable',
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
];
