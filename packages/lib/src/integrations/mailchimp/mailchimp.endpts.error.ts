import { z } from 'zod/v4';

export const mailchimpErrorSchema = z.object({
	type: z.string(),
	title: z.string(),
	status: z.number(),
	detail: z.string(),
	instance: z.string(),
});
