import { isDevelopment } from './environment';

const logTypeToEnv = {
	alerts: process.env.BARELY_SLACK_HOOK_ALERTS,
	errors: process.env.BARELY_SLACK_HOOK_ERRORS,
	sales: process.env.BARELY_SLACK_HOOK_SALES,
	users: process.env.BARELY_SLACK_HOOK_USERS,
	logs: process.env.BARELY_SLACK_HOOK_LOGS,
};

const TYPE_ICONS = {
	alerts: ':rotating_light:',
	errors: ':no_entry:',
	sales: ':money_with_wings:',
	users: ':busts_in_silhouette:',
	logs: ':speech_balloon:',
};

export const log = async ({
	message,
	type,
	location,
	mention = false,
}: {
	type: 'alerts' | 'errors' | 'sales' | 'users' | 'logs';
	location: string;
	message: string;
	mention?: boolean;
}) => {
	/* 
  Log a message to the console 
  */
	if (
		isDevelopment() ||
		!process.env.BARELY_SLACK_HOOK_ALERTS ||
		!process.env.BARELY_SLACK_HOOK_ERRORS ||
		!process.env.BARELY_SLACK_HOOK_SALES ||
		!process.env.BARELY_SLACK_HOOK_USERS ||
		!process.env.BARELY_SLACK_HOOK_LOGS
	) {
		return console.log(`>> ${location ? `loc :: ${location} // ` : ''}`, message);
	}

	const HOOK = logTypeToEnv[type];
	if (!HOOK) return;

	const mentionUser = process.env.BARELY_SLACK_NOTIFY_USER ?? null;

	try {
		/* 
		Log a message to Threads error channel 
		*/

		return await fetch(HOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `${mention && mentionUser ? `<@${mentionUser}>\n` : ''}${TYPE_ICONS[type]} *${location}*\n${message}`,
						},
					},
				],
			}),
		});
	} catch (error) {
		console.log('Failed to log to Barely Slack. Error: ', error);
	}
};
