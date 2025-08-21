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
		address: text('address'),
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
