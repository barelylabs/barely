import baseConfig from '@barely/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{ts,tsx}', '../../packages/ui/**/*.{ts,tsx}'],
	presets: [baseConfig],
} satisfies Config;
