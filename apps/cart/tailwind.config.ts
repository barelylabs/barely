import type { Config } from 'tailwindcss';
import baseConfig from '@barely/tailwind-config';

export default {
	content: ['./src/**/*.{ts,tsx}', '../../packages/ui/**/*.{ts,tsx}'],
	presets: [baseConfig],
} satisfies Config;
