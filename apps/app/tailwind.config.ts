import baseConfig from '@barely/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{ts,tsx}',
		'../../packages/ui/**/*.{ts,tsx}',
		'../../node_modules/@tremor/**/*.{js,ts,jsx,tsx}', // Tremor module
	],
	presets: [baseConfig],
} satisfies Config;
