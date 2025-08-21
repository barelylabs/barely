import type { InvoiceEmails } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const insertInvoiceEmailSchema = createInsertSchema(InvoiceEmails, {
	resendId: z.string().min(1, 'Resend ID is required'),
	emailType: z.enum([
		'initial',
		'reminder',
		'overdue',
		'payment_confirmation',
		'receipt',
	]),
	sendIndex: z.number().int().min(0),
	status: z.enum([
		'pending',
		'sent',
		'delivered',
		'opened',
		'clicked',
		'bounced',
		'complained',
		'failed',
	]),
	metadata: z
		.object({
			subject: z.string().optional(),
			from: z.string().optional(),
			to: z.string().optional(),
			clickedLinks: z.array(z.string()).optional(),
			openCount: z.number().optional(),
			lastOpenedAt: z.string().optional(),
		})
		.optional(),
});

export const createInvoiceEmailSchema = insertInvoiceEmailSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateInvoiceEmailSchema = insertInvoiceEmailSchema
	.partial()
	.required({ id: true });

export const selectInvoiceEmailSchema = createSelectSchema(InvoiceEmails);

export const invoiceEmailFilterSchema = z.object({
	invoiceId: z.string().optional(),
	resendId: z.string().optional(),
	emailType: z
		.enum(['initial', 'reminder', 'overdue', 'payment_confirmation', 'receipt'])
		.optional(),
	status: z
		.enum([
			'pending',
			'sent',
			'delivered',
			'opened',
			'clicked',
			'bounced',
			'complained',
			'failed',
		])
		.optional(),
	search: z.string().optional(),
});

export type InsertInvoiceEmail = z.infer<typeof insertInvoiceEmailSchema>;
export type UpdateInvoiceEmail = z.infer<typeof updateInvoiceEmailSchema>;
export type InvoiceEmail = z.infer<typeof selectInvoiceEmailSchema>;
