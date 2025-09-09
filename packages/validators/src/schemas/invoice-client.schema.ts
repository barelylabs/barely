import type { InferSelectModel } from 'drizzle-orm';
import { InvoiceClients } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { querySelectionSchema } from '../helpers';

export const insertInvoiceClientSchema = createInsertSchema(InvoiceClients);
export const createInvoiceClientSchema = insertInvoiceClientSchema.omit({
	id: true,
	workspaceId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	archivedAt: true,
	stripeCustomerId: true,
});
export const updateInvoiceClientSchema = insertInvoiceClientSchema
	.partial()
	.required({ id: true });
export const upsertInvoiceClientSchema = insertInvoiceClientSchema.partial({
	id: true,
	workspaceId: true,
	stripeCustomerId: true,
});

export type InsertInvoiceClient = z.input<typeof insertInvoiceClientSchema>;
export type CreateInvoiceClient = z.input<typeof createInvoiceClientSchema>;
export type UpsertInvoiceClient = z.input<typeof upsertInvoiceClientSchema>;
export type UpdateInvoiceClient = z.input<typeof updateInvoiceClientSchema>;
export type InvoiceClient = InferSelectModel<typeof InvoiceClients>;

// forms
export const invoiceClientFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});

export const invoiceClientSearchParamsSchema = invoiceClientFilterParamsSchema.extend({
	selectedClientIds: querySelectionSchema.optional(),
	showCreateModal: z.boolean().optional(),
	showUpdateModal: z.boolean().optional(),
	showArchiveModal: z.boolean().optional(),
	showDeleteModal: z.boolean().optional(),
});

export const selectWorkspaceInvoiceClientsSchema = invoiceClientFilterParamsSchema.extend(
	{
		cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
		limit: z.coerce.number().min(1).max(100).optional().default(20),
	},
);

export const defaultInvoiceClient: CreateInvoiceClient = {
	name: '',
	email: '',
	company: null,
	address: null,
	addressLine1: null,
	addressLine2: null,
	city: null,
	state: null,
	country: null,
	postalCode: null,
};
