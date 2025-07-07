import { additionalPackages } from '@trigger.dev/build/extensions/core';
import { defineConfig } from '@trigger.dev/sdk/v3';

export const config = defineConfig({
	project: 'proj_qknwxraxikbauwjfqxlr',
	maxDuration: 60,
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	enableConsoleLogging: true,
	dirs: ['./src/trigger'],
	build: {
		jsx: {
			automatic: true,
		},
		extensions: [
			additionalPackages({
				packages: ['resend@4.6.0'],
			}),
		],
	},
});
