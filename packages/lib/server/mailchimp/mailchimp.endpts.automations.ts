// import { z } from 'zod';

// export function getMailchimpAutomations({
// 	accessToken,
// 	server,
// }: {
// 	accessToken: string;
// 	server: string;
// }) {
// 	const endpoint = `https://${server}.api.mailchimp.com/3.0/automations?fields=automations.id,automations.type,automations.settings`;
// }

// const getMailchimpAutomationsSchema = z.object({
// 	total_items: z.number(),
// 	_links: z.object({}),
// 	automations: z.array(
// 		z.object({
// 			id: z.string(),
// 			type: z.string(),
// 			create_time: z.string(),
// 			start_time: z.string(),
// 			status: z.enum(['save', 'pause', 'sending']),
// 			emails_sent: z.number(),
// 			recipients: z.object({}),
// 			settings: z.object({
// 				title: z.string(),
// 				from_name: z.string(),
// 				reply_to: z.string(),
// 				use_conversation: z.boolean(),
// 				to_name: z.string(),
// 				authenticate: z.boolean(),
// 				auto_footer: z.boolean(),
// 				inline_css: z.boolean(),
// 			}),
// 			tracking: z.object({}),
// 		}),
// 	),
// });
