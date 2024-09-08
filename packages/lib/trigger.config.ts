// import { resolve } from 'path';
import type {
	// ResolveEnvironmentVariablesFunction,
	TriggerConfig,
} from '@trigger.dev/sdk/v3';

// import * as dotenv from 'dotenv';

// dotenv.config({
// 	path: resolve(__dirname, '../../.env'),
// });

// export const resolveEnvVars: ResolveEnvironmentVariablesFunction = () => {
// 	return {
// 		variables: Object.entries(process.env).map(([key, value]) => ({
// 			name: key,
// 			value: value ?? '',
// 		})),
// 	};
// };

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

	dependenciesToBundle: [/.*/],
	enableConsoleLogging: true, // enable console logging with dev cli
	//The paths for your trigger folders
	triggerDirectories: ['./trigger'],
	additionalPackages: ['resend@3.2.0'],
};
