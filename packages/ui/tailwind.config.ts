import baseConfig from '@barely/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./elements/**/*.{ts,tsx}',
		'./charts/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./forms/**/*.{ts,tsx}',
		'../../node_modules/@tremor/**/*.{js,ts,jsx,tsx}', // Tremor module
	],
	presets: [baseConfig],
} satisfies Config;
