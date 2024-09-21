import { z } from 'zod';

const emailBouncedSchema = z.object({
	type: z.literal('email.bounced'),
	created_at: z.coerce.date(),
	data: z.object({
		created_at: z.coerce.date(),
		email_id: z.string(),
		from: z.string(),
		to: z.array(z.string()),
		subject: z.string(),
	}),
});

const emailDeliveredSchema = z.object({
	type: z.literal('email.delivered'),
	created_at: z.coerce.date(),
	data: z.object({
		created_at: z.coerce.date(),
		email_id: z.string(),
		from: z.string(),
		to: z.array(z.string()),
		subject: z.string(),
	}),
});

const emailOpenedSchema = z.object({
	type: z.literal('email.opened'),
	created_at: z.coerce.date(),
	data: z.object({
		created_at: z.coerce.date(),
		email_id: z.string(),
		from: z.string(),
		to: z.array(z.string()),
		subject: z.string(),
	}),
});

const emailClickedSchema = z.object({
	type: z.literal('email.clicked'),
	created_at: z.coerce.date(),
	data: z.object({
		created_at: z.coerce.date(),
		email_id: z.string(),
		from: z.string(),
		to: z.array(z.string()),
		subject: z.string(),
		click: z.object({
			ipAddress: z.string(),
			link: z.string(),
			timestamp: z.coerce.date(),
			userAgent: z.string(),
		}),
	}),
});

const emailComplainedSchema = z.object({
	type: z.literal('email.complained'),
	created_at: z.coerce.date(),
	data: z.object({
		created_at: z.coerce.date(),
		email_id: z.string(),
		from: z.string(),
		to: z.array(z.string()),
		subject: z.string(),
	}),
});

export const emailEventSchema = z.union([
	emailBouncedSchema,
	emailOpenedSchema,
	emailClickedSchema,
	emailComplainedSchema,
	emailDeliveredSchema,
]);
