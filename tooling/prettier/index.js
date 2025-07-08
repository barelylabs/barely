import { fileURLToPath } from 'url';

/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
	arrowParens: 'avoid',
	printWidth: 90,
	singleQuote: true,
	jsxSingleQuote: true,
	semi: true,
	trailingComma: 'all',
	useTabs: true,
	tabWidth: 2,
	plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
	tailwindConfig: fileURLToPath(
		new URL('../../tooling/tailwind/index.ts', import.meta.url),
	),
	experimentalTernaries: true,
	tailwindFunctions: ['cn', 'cva'],
	importOrder: [
		'<TYPES>',
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
		'',
		'<TYPES>^[.|..|~]',
		'^~/',
		'^[../]',
		'^[./]',
	],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderTypeScriptVersion: '4.4.0',
	overrides: [
		{
			files: '*.json.hbs',
			options: {
				parser: 'json',
			},
		},
		{
			files: '*.js.hbs',
			options: {
				parser: 'babel',
			},
		},
	],
};

export default config;
