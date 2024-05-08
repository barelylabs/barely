import type { TriggerConfig } from '@trigger.dev/sdk/v3';

export const config: TriggerConfig = {
	//Your project ref (you can see it on the Project settings page in the dashboard)
	project: 'proj_qknwxraxikbauwjfqxlr',
	retries: {
		//If you want to retry a task in dev mode (when using the CLI)
		enabledInDev: false,
		//the default retry settings. Used if you don't specify on a task.
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	dependenciesToBundle: [
		'@t3-oss/env-core',
		'@t3-oss/env-nextjs',
		'@barely/email',
		/@barely\/email\/.*/,
		'nanoid',
	],
	enableConsoleLogging: true, // enable console logging with dev cli
	//The paths for your trigger folders
	triggerDirectories: ['./trigger'],
};
