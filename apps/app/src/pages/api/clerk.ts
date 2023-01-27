import { Webhook } from 'svix';
// import { buffer } from 'micro';

import env from '~/env';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { z } from 'zod';

export const config = {
	api: {
		bodyParser: false,
	},
};

const secret = env.CLERK_WEBHOOK_USER_SECRET_KEY;

async function buffer(readable: Readable) {
	const chunks = [];
	for await (const chunk of readable) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

export default async function userHandler(req: NextApiRequest, res: NextApiResponse) {
	// console.log('user-update req => ', req.body);
	console.log('req.headers => ', req.headers);
	const payload = (await buffer(req)).toString();
	const headers = req.headers as Record<string, string>;

	const wh = new Webhook(secret);
	let msg;
	try {
		msg = wh.verify(payload, headers);
	} catch (err) {
		res.status(400).json({});
	}

	console.log('msg => ', msg);

	res.json({});
}

const objectSchema = z.object({
	object: z.literal('event'),
	// type: z.enum(['user.created', 'user.deleted', 'user.updated']),
});

const userDataSchema = z.object({
	id: z.string(),
	first_name: z.string().nullable(),
	last_name: z.string(),
	full_name: z.string().nullable(),
	username: z.string().nullable(),
	profile_image_url: z.string().nullable(),
	primary_email_address: z.string().email().nullable(),
	primary_email_address_id: z.string(),
	email_addresses: z.array(
		z.object({
			email_address: z.string().email(),
			id: z.string(),
			// linked_to: z.array(), // TODO: add type
			object: z.literal('email_address'),
			verification: z.object({
				status: z.enum(['verified', 'unverified']),
				strategy: z.literal('admin'),
			}),
		}),
	),
	birthday: z.string(),
	created_at: z.date(),
	external_id: z.string().nullable(),
	updated_at: z.date(),
	gender: z.string(),
	last_sign_in_at: z.date().nullable(),
	object: z.literal('user'),
	password_enabled: z.boolean(),
	phone_numbers: z.array(
		z.object({
			id: z.string(),
			phone_number: z.string(),
			reserved_for_second_factor: z.boolean(),
			default_second_factor: z.boolean(),
			// linked_to: z.array(), // TODO: add type
			// verification: z.array() // TODO: add type
		}),
	), // TODO: add type
	primary_phone_number: z.string().nullable(), // TODO: add type
	primary_phone_number_id: z.string().nullable(),
	primary_web3_wallet_id: z.string().nullable(),
	// web3_wallets: z.array()// TODO: add type
	// external_accounts: z.array()// TODO: add type
	totp_enabled: z.boolean(),
	backup_codes_enabled: z.boolean(),

	// private_metadata: // TODO: add type
	// public_metadata: // TODO: add type
	// unsafe_metadata: // TODO: add type

	two_factor_enabled: z.boolean(),

	// web3_wallets: z.array()// TODO: add type
});

const organizationDataSchema = z.object({
	id: z.string(),
	logoUrl: z.string(),
	name: z.string(),
	// publicMetadata: z.object({}), // TODO update with public metadata when ready (stripeId?)
	slug: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const eventTypeSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.enum(['user.created', 'user.deleted', 'user.updated']),
		data: userDataSchema,
	}),
]);

const endpointSchema = z.union([objectSchema, eventTypeSchema]);
