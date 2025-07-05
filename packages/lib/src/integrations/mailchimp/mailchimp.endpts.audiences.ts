import type { Fan } from '@barely/validators';
import { parseFullName, zGet, zPost } from '@barely/utils';
import { z } from 'zod/v4';

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

	// if (res.success && !res.parsed) {
	// 	throw new Error('Mailchimp response could not be parsed');
	// }

	if (!res.success && res.parsed) {
		console.error('Mailchimp response failed', res.data);
		throw new Error('Mailchimp response failed');
	}

	// if (!res.success) {
	console.error('Mailchimp response failed', res.data);
	throw new Error('Mailchimp response failed');
	// }
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

export async function addToMailchimpAudience({
	accessToken,
	server,
	listId,
	fan,
	tags,
}: {
	accessToken: string;
	server: string;
	listId: string;
	fan: Fan;
	tags?: string[];
}) {
	const endpoint = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;

	const { firstName, lastName } = parseFullName(fan.fullName);

	const res = await zPost(endpoint, addToMailchimpAudienceSchema, {
		auth: `Bearer ${accessToken}`,
		body: {
			email_address: fan.email,
			status: 'subscribed',
			merge_fields: {
				FNAME: firstName,
				LNAME: lastName,
				// ADDRESS: {
				// 	addr1: fan.shippingAddressLine1,
				// 	addr2: fan.shippingAddressLine2,
				// 	city: fan.shippingAddressCity,
				// 	state: fan.shippingAddressState,
				// 	zip: fan.shippingAddressPostalCode,
				// 	country: fan.shippingAddressCountry,
				// },
			},
			tags: tags,
		},
		errorSchema: mailchimpErrorSchema,
		logResponse: true,
	});

	if (res.success && res.parsed) {
		return res.data;
	}

	// if (res.success && !res.parsed) {
	// 	throw new Error('Mailchimp response could not be parsed');
	// }

	if (!res.success && res.parsed) {
		console.error('Mailchimp response failed', res.data);
		throw new Error('Mailchimp response failed');
	}

	console.error('Mailchimp response failed', res.data);
	throw new Error('Mailchimp response failed');
}

const addToMailchimpAudienceSchema = z.object({
	id: z.string(),
	email_address: z.string(),
	unique_email_id: z.string(),
	email_type: z.string(),
	status: z.string(),
	merge_fields: z.object({}),
	stats: z.object({}),
	ip_signup: z.string(),
	timestamp_signup: z.string(),
	ip_opt: z.string(),
	timestamp_opt: z.string(),
	member_rating: z.number(),
	last_changed: z.string(),
	language: z.string(),
	vip: z.boolean(),
	email_client: z.string(),
	location: z.object({}),
	marketing_permissions: z.array(z.object({})).optional(),
	tags: z.array(z.object({})),
	list_id: z.string(),
	_links: z.array(z.object({})),
});
