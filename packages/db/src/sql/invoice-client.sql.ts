import { relations } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Invoices } from './invoice.sql';
import { Workspaces } from './workspace.sql';

export const InvoiceClients = pgTable(
	'InvoiceClients',
	{
		...primaryId,

		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// Client information
		name: varchar('name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		company: varchar('company', { length: 255 }),
		address: text('address'), // deprecated

		// new fields
		country: varchar('country', { length: 255 }),
		addressLine1: varchar('addressLine1', { length: 255 }),
		addressLine2: varchar('addressLine2', { length: 255 }),
		city: varchar('city', { length: 255 }),
		state: varchar('state', { length: 255 }),
		postalCode: varchar('postalCode', { length: 255 }),

		// stripe customer id
		stripeCustomerId: varchar('stripeCustomerId', { length: 255 }).notNull(),
	},
	client => ({
		workspace: index('InvoiceClients_workspace_idx').on(client.workspaceId),
		email: index('InvoiceClients_email_idx').on(client.email),
		workspaceEmail: uniqueIndex('InvoiceClients_workspace_email_unique').on(
			client.workspaceId,
			client.email,
		),
	}),
);

export const InvoiceClient_Relations = relations(InvoiceClients, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [InvoiceClients.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-one
	invoices: many(Invoices),
}));
