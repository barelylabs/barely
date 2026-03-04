import { isDevelopment } from '@barely/utils';

import { libEnv } from '../../env';

const logTypeToEnv = {
	alerts: libEnv.BARELY_SLACK_HOOK_ALERTS,
	errors: libEnv.BARELY_SLACK_HOOK_ERRORS,
	leads: libEnv.BARELY_SLACK_HOOK_LEADS,
	sales: libEnv.BARELY_SLACK_HOOK_SALES,
	users: libEnv.BARELY_SLACK_HOOK_USERS,
	logs: libEnv.BARELY_SLACK_HOOK_LOGS,
};

const TYPE_ICONS = {
	alerts: ':rotating_light:',
	errors: ':no_entry:',
	leads: ':briefcase:',
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
	type: 'alerts' | 'errors' | 'leads' | 'sales' | 'users' | 'logs';
	location: string;
	message: string;
	mention?: boolean;
}) => {
	if (isDevelopment()) {
		return console.log(`>> ${location ? `loc :: ${location} // ` : ''}`, message);
	}

	const HOOK = logTypeToEnv[type];
	if (!HOOK) return;

	const mentionUser = libEnv.BARELY_SLACK_NOTIFY_USER ?? null;

	try {
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
