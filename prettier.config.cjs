/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
module.exports = {
	arrowParens: 'avoid',
	printWidth: 90,
	singleQuote: true,
	jsxSingleQuote: true,
	semi: true,
	trailingComma: 'all',
	useTabs: true,
	tabWidth: 2,
	plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
	tailwindConfig: './packages/config/tailwind',
	importOrder: [
		'^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
		'^(next/(.*)$)|^(next$)',
		'<THIRD_PARTY_MODULES>',
		'',
		'^@barely/api/(.*)$',
		'',
		'^@barely/atoms/(.*)$',
		'',
		'^@barely/auth/(.*)$',
		'',
		'^@barely/hooks/(.*)$',
		'',
		'^@barely/ui/(.*)$',
		'',
		'^@barely/utils/(.*)$',
		'',
		'^~/utils/(.*)$',
		'^~/components/(.*)$',
		'^~/styles/(.*)$',
		'^~/(.*)$',
		'^[./]',
	],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderTypeScriptVersion: '4.4.0',
};

/** 
had to use cjs/module.exports because of this issue:
https://github.com/prettier/prettier-vscode/issues/3066
*/

// export default config;
