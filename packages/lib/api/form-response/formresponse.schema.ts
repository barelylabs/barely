import { z } from 'zod';

const formResponseSchema = z.object({
	id: z.string(),
	createdAt: z.date().optional(),
	formId: z.string(),
	name: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	message: z.string().optional(),
});

export { formResponseSchema };
