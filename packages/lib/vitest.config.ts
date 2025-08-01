import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./vitest-env-setup.config.js', './src/test-setup.ts'],
		// Increase timeout for tests that might need more time
		testTimeout: 10000,
	},
});
