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
		// t3-env
		'@t3-oss/env-core',
		'@t3-oss/env-nextjs',
		// uploadthing
		'@uploadthing/shared',
		'@uploadthing/mime-types',
		'std-env',

		// internal
		'@barely/email',
		/@barely\/email\/.*/,
		'nanoid',
	],
	enableConsoleLogging: true, // enable console logging with dev cli
	//The paths for your trigger folders
	triggerDirectories: ['./trigger'],
	additionalPackages: ['resend@3.2.0', '@react-email/column@0.1.10'],
	// additionalPackages: ['@react-email/render@0.1.13'],
	// additionalPackages: ['@uploadthing/shared@6.2.1', '@uploadthing/mime-types@0.2.2'],
};
