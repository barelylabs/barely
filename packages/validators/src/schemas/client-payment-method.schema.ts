import { z } from 'zod/v4';

export const clientPaymentMethodSchema = z.object({
	id: z.string(),
	clientId: z.string(),
	stripePaymentMethodId: z.string(),
	type: z.enum(['card', 'us_bank_account', 'link', 'cashapp']),
	last4: z.string(),
	brand: z.string().nullable().optional(),
	expiryMonth: z.number().nullable().optional(),
	expiryYear: z.number().nullable().optional(),
	bankName: z.string().nullable().optional(),
	accountType: z.string().nullable().optional(),
	isDefault: z.boolean(),
	fingerprint: z.string().nullable().optional(),
	createdAt: z.date(),
	lastUsedAt: z.date().nullable().optional(),
	deletedAt: z.date().nullable().optional(),
});

export const createClientPaymentMethodSchema = clientPaymentMethodSchema.omit({
	id: true,
	createdAt: true,
	lastUsedAt: true,
	deletedAt: true,
});

export const updateClientPaymentMethodSchema = clientPaymentMethodSchema
	.partial()
	.required({ id: true });

export type ClientPaymentMethod = z.infer<typeof clientPaymentMethodSchema>;
export type CreateClientPaymentMethod = z.infer<typeof createClientPaymentMethodSchema>;
export type UpdateClientPaymentMethod = z.infer<typeof updateClientPaymentMethodSchema>;
