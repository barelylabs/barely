// Workaround for TypeScript limitation with flat config
// See: https://github.com/typescript-eslint/typescript-eslint/issues/7284

declare module 'eslint-plugin-import' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin;
	export default plugin;
}

declare module 'eslint-plugin-turbo' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin;
	export default plugin;
}

declare module 'eslint-plugin-react' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin & {
		configs: {
			flat?: {
				recommended: ESLint.ConfigData;
				'jsx-runtime': ESLint.ConfigData;
			};
			recommended: ESLint.ConfigData;
			'jsx-runtime': ESLint.ConfigData;
		};
	};
	export default plugin;
}

declare module 'eslint-plugin-react-hooks' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin & {
		configs: {
			recommended: ESLint.ConfigData;
		};
	};
	export default plugin;
}

declare module 'eslint-plugin-jsx-a11y' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin;
	export default plugin;
}

declare module '@next/eslint-plugin-next' {
	import type { ESLint } from 'eslint';
	const plugin: ESLint.Plugin & {
		configs: {
			recommended: ESLint.ConfigData;
			'core-web-vitals': ESLint.ConfigData;
		};
	};
	export default plugin;
}
