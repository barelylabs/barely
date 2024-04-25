import { z } from 'zod';

import { zGet } from '../../utils/zod-fetch';
import { mailchimpErrorSchema } from './mailchimp.endpts.error';

export async function getMailchimpAudiences({
	accessToken,
	server,
}: {
	accessToken: string;
	server: string;
}) {
	const endpoint = `https://${server}.api.mailchimp.com/3.0/lists`;
	const res = await zGet(endpoint, getMailchimpAudiencesSchema, {
		auth: `Bearer ${accessToken}`,
		errorSchema: mailchimpErrorSchema,
		logResponse: true,
	});

	if (res.success && res.parsed) {
		return res.data;
	}

	if (res.success && !res.parsed) {
		throw new Error('Mailchimp response could not be parsed');
	}

	if (!res.success && res.parsed) {
		console.error('Mailchimp response failed', res.data);
		throw new Error('Mailchimp response failed');
	}

	if (!res.success && !res.parsed) {
		console.error('Mailchimp response failed', res.data);
		throw new Error('Mailchimp response failed');
	}
}

const getMailchimpAudiencesSchema = z.object({
	total_items: z.number(),
	// _links: z.array(z.object({})),

	lists: z.array(
		z.object({
			id: z.string(),
			web_id: z.number(),
			name: z.string(),
			contact: z.object({
				company: z.string(),
				address1: z.string(),
				address2: z.string(),
				city: z.string(),
				state: z.string(),
				zip: z.string(),
				country: z.string(),
				phone: z.string(),
			}),
			permission_reminder: z.string(),
			use_archive_bar: z.boolean(),
			campaign_defaults: z.object({
				from_name: z.string(),
				from_email: z.string(),
				subject: z.string(),
				language: z.string(),
			}),
			notify_on_subscribe: z.string(),
			notify_on_unsubscribe: z.string(),
			date_created: z.string(),
			list_rating: z.number(),
			email_type_option: z.boolean(),
			subscribe_url_short: z.string(),
			subscribe_url_long: z.string(),
			beamer_address: z.string(),
			visibility: z.string(),
			modules: z.array(z.object({})),
			stats: z.object({
				member_count: z.number(),
				unsubscribe_count: z.number(),
				cleaned_count: z.number(),
				member_count_since_send: z.number(),
				unsubscribe_count_since_send: z.number(),
				cleaned_count_since_send: z.number(),
				campaign_count: z.number(),
			}),
			_links: z.array(z.object({})),
		}),
	),
});
