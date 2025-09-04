import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { InvoiceClients } from './invoice-client.sql';
import { Workspaces } from './workspace.sql';

export const INVOICE_STATUSES = [
	'created',
	'sent',
	'viewed',
	'paid',
	// 'overdue',
	'voided',
] as const;

export interface InvoiceLineItem {
	description: string;
	quantity: number;
	rate: number;
	amount: number;
}

export const Invoices = pgTable(
	'Invoices',
	{
		...primaryId,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// Invoice identifiers
		invoiceNumber: varchar('invoiceNumber', { length: 255 }).notNull(),

		// Client relationship
		clientId: dbId('clientId')
			.notNull()
			.references(() => InvoiceClients.id, {
				onUpdate: 'cascade',
				onDelete: 'restrict',
			}),

		// Invoice details
		lineItems: jsonb('lineItems').$type<InvoiceLineItem[]>().notNull(),
		tax: integer('tax').default(0).notNull(), // Stored as percentage * 100 (e.g., 750 = 7.5%)
		subtotal: integer('subtotal').notNull(), // Stored in cents
		total: integer('total').notNull(), // Stored in cents
		poNumber: text('poNumber'), // Optional purchase order number
		payerMemo: text('payerMemo'), // Optional notes to display on invoice
		notes: text('notes'), // Optional notes to display on invoice

		// Dates and status
		dueDate: timestamp('dueDate').notNull(),
		status: varchar('status', {
			length: 255,
			enum: INVOICE_STATUSES,
		})
			.default('created')
			.notNull(),

		// Payment tracking
		stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),

		// Email tracking
		lastResendId: varchar('lastResendId', { length: 255 }), // Track the most recent Resend email ID

		// Activity tracking
		sentAt: timestamp('sentAt'),
		viewedAt: timestamp('viewedAt'),
		paidAt: timestamp('paidAt'),
	},
	invoice => ({
		workspace: index('Invoices_workspace_idx').on(invoice.workspaceId),
		client: index('Invoices_client_idx').on(invoice.clientId),
		status: index('Invoices_status_idx').on(invoice.status),
		workspaceNumber: uniqueIndex('Invoices_workspace_number_unique').on(
			invoice.workspaceId,
			invoice.invoiceNumber,
		),
		workspaceStatus: index('Invoices_workspace_status_idx').on(
			invoice.workspaceId,
			invoice.status,
		),
		dueDate: index('Invoices_dueDate_idx').on(invoice.dueDate),
	}),
);

export const Invoice_Relations = relations(Invoices, ({ one }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Invoices.workspaceId],
		references: [Workspaces.id],
	}),
	client: one(InvoiceClients, {
		fields: [Invoices.clientId],
		references: [InvoiceClients.id],
	}),
}));
