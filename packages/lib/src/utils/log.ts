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

export function escapeSlackMrkdwn(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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

	// Always log errors/alerts to console so they appear in Vercel logs
	if (type === 'errors' || type === 'alerts') {
		console.error(`[${type}] ${location}: ${message}`);
	}

	const HOOK = logTypeToEnv[type];
	if (!HOOK) {
		console.warn(
			`[log] No Slack webhook configured for type "${type}" — message dropped: ${message}`,
		);
		return;
	}

	const mentionUser = libEnv.BARELY_SLACK_NOTIFY_USER ?? null;
	const prefix = `${mention && mentionUser ? `<@${mentionUser}>\n` : ''}${TYPE_ICONS[type]} *${location}*\n`;

	// Slack block text limit is 3000 chars per block.
	// Split long messages across multiple blocks to avoid truncation.
	const SLACK_BLOCK_LIMIT = 2900; // leave buffer under the 3000 hard limit
	const firstBlockMaxLength = SLACK_BLOCK_LIMIT - prefix.length;

	const blocks: { type: 'section'; text: { type: 'mrkdwn'; text: string } }[] = [];

	if (message.length <= firstBlockMaxLength) {
		blocks.push({
			type: 'section',
			text: { type: 'mrkdwn', text: `${prefix}${message}` },
		});
	} else {
		// First block includes the prefix
		blocks.push({
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `${prefix}${message.slice(0, firstBlockMaxLength)}`,
			},
		});

		// Remaining message in continuation blocks (max 50 blocks per Slack message)
		let offset = firstBlockMaxLength;
		while (offset < message.length && blocks.length < 50) {
			blocks.push({
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: message.slice(offset, offset + SLACK_BLOCK_LIMIT),
				},
			});
			offset += SLACK_BLOCK_LIMIT;
		}
	}

	try {
		const res = await fetch(HOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ blocks }),
		});

		if (!res.ok) {
			throw new Error(`Slack responded ${res.status}`);
		}
	} catch (error) {
		// Fallback: try a simple error message to #errors channel
		try {
			const errHook = logTypeToEnv.errors;
			if (errHook) {
				await fetch(errHook, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						blocks: [
							{
								type: 'section',
								text: {
									type: 'mrkdwn',
									text: `:warning: *[log fallback]* Failed to log to #${type} from ${location}: ${String(error instanceof Error ? error.message : error).slice(0, 200)}`,
								},
							},
						],
					}),
				});
			}
		} catch {
			// Last resort: console.error so it appears in Vercel logs
			console.error(
				`[log] Failed to log to Slack. type=${type}, location=${location}, message=${message.slice(0, 500)}`,
			);
		}
	}
};
