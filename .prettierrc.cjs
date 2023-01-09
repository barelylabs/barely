/** @type {import("prettier").Config} */
module.exports = {
	arrowParens: 'avoid',
	printWidth: 90,
	singleQuote: true,
	jsxSingleQuote: true,
	semi: true,
	trailingComma: 'all',
	useTabs: true,
	tabWidth: 2,
	plugins: [require('prettier-plugin-tailwindcss'), require('prettier-plugin-prisma')],
	tailwindConfig: './config/tailwind',
};
