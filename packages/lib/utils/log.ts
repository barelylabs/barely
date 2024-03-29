import { z } from 'zod';

import { env } from '../env';
import { zPost } from './zod-fetch';

export const log = async (opts: {
	type: 'link' | 'stripe' | 'meta';
	fn: string;
	message: string;
	mention?: boolean;
}) => {
	/* 
  Log a message to the console 
  */
	if (process.env.NODE_ENV === 'development' || !env.BOT_THREADS_API_KEY) {
		return console.log(`>> ${opts.fn ? `fn :: ${opts.fn} // ` : ''}`, opts.message);
	}

	try {
		/* 
		Log a message to Threads error channel 
		*/

		await zPost('https://threads.com/api/public/postThread', z.object({}), {
			auth: `Bearer ${env.BOT_THREADS_API_KEY}`,
			body: {
				channel: `${opts.type}-errors`,
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: `${opts.mention ? '<@34548329863> ' : ''}${opts.message}`,
						},
					},
				],
			},
			logResponse: true,
		});
	} catch (error) {
		console.log('Failed to log to Barely Threads. Error: ', error);
	}
};
