import type { TriggerConfig } from '@trigger.dev/sdk/v3';
import { additionalPackages } from '@trigger.dev/build/extensions/core';

export const config: TriggerConfig = {
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
		extensions: [
			additionalPackages({
				packages: ['resend@4.6.0'],
			}),
		],
	},

	// additionalPackages: ['resend@3.2.0'],
};
