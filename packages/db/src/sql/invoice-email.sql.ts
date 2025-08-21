import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	jsonb,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Invoices } from './invoice.sql';

export const EMAIL_STATUS = [
	'pending',
	'sent',
	'delivered',
	'opened',
	'clicked',
	'bounced',
	'complained',
	'failed',
] as const;

export const EMAIL_TYPE = [
	'initial',
	'reminder',
	'overdue',
	'payment_confirmation',
	'receipt',
] as const;

export interface EmailMetadata {
	subject?: string;
	from?: string;
	to?: string;
	clickedLinks?: string[];
	openCount?: number;
	lastOpenedAt?: string;
}

export const InvoiceEmails = pgTable(
	'InvoiceEmails',
	{
		...primaryId,

		invoiceId: dbId('invoiceId')
			.notNull()
			.references(() => Invoices.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// Email tracking
		resendId: varchar('resendId', { length: 255 }).notNull(),
		emailType: varchar('emailType', {
			length: 255,
			enum: EMAIL_TYPE,
		})
			.default('initial')
			.notNull(),

		// Send order tracking
		sendIndex: integer('sendIndex').notNull().default(0), // 0 for initial, 1+ for reminders

		// Status tracking
		status: varchar('status', {
			length: 255,
			enum: EMAIL_STATUS,
		})
			.default('pending')
			.notNull(),

		// Timestamps for email lifecycle
		sentAt: timestamp('sentAt'),
		deliveredAt: timestamp('deliveredAt'),
		openedAt: timestamp('openedAt'), // First open
		clickedAt: timestamp('clickedAt'), // First click
		bouncedAt: timestamp('bouncedAt'),
		complainedAt: timestamp('complainedAt'),
		failedAt: timestamp('failedAt'),

		// Additional metadata
		metadata: jsonb('metadata').$type<EmailMetadata>(),
	},
	invoiceEmail => ({
		invoice: index('InvoiceEmails_invoice_idx').on(invoiceEmail.invoiceId),
		resendId: uniqueIndex('InvoiceEmails_resendId_unique').on(invoiceEmail.resendId),
		invoiceType: index('InvoiceEmails_invoice_type_idx').on(
			invoiceEmail.invoiceId,
			invoiceEmail.emailType,
		),
		invoiceSendIndex: uniqueIndex('InvoiceEmails_invoice_sendIndex_unique').on(
			invoiceEmail.invoiceId,
			invoiceEmail.sendIndex,
		),
		status: index('InvoiceEmails_status_idx').on(invoiceEmail.status),
	}),
);

export const InvoiceEmail_Relations = relations(InvoiceEmails, ({ one }) => ({
	invoice: one(Invoices, {
		fields: [InvoiceEmails.invoiceId],
		references: [Invoices.id],
	}),
}));
