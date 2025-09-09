import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { dbId, primaryId } from '../utils';
import { InvoiceClients } from './invoice-client.sql';

export const ClientPaymentMethods = pgTable(
	'ClientPaymentMethods',
	{
		// Identifiers
		...primaryId,
		clientId: dbId('clientId')
			.notNull()
			.references(() => InvoiceClients.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		// Stripe Data
		stripePaymentMethodId: text('stripePaymentMethodId').notNull(),

		// Payment Method Details
		type: text('type', {
			enum: ['card', 'us_bank_account', 'link', 'cashapp'],
		})
			.notNull()
			.default('card'),

		// Card specific fields
		last4: text('last4'),
		brand: text('brand'), // visa, mastercard, amex, etc.
		expiryMonth: integer('expiryMonth'),
		expiryYear: integer('expiryYear'),

		// Bank account specific fields
		bankName: text('bankName'),
		accountType: text('accountType'), // checking, savings

		// Metadata
		isDefault: boolean('isDefault').notNull().default(false),
		fingerprint: text('fingerprint'), // Stripe's fingerprint for deduplication

		// Timestamps
		createdAt: timestamp('createdAt').notNull().defaultNow(),
		lastUsedAt: timestamp('lastUsedAt'),
		deletedAt: timestamp('deletedAt'),
	},
	table => ({
		clientIdx: index('ClientPaymentMethods_clientId_idx').on(table.clientId),
		stripeIdx: index('ClientPaymentMethods_stripePaymentMethodId_idx').on(
			table.stripePaymentMethodId,
		),
		defaultIdx: index('ClientPaymentMethods_clientId_isDefault_idx').on(
			table.clientId,
			table.isDefault,
		),
		fingerprintIdx: index('ClientPaymentMethods_clientId_fingerprint_idx').on(
			table.clientId,
			table.fingerprint,
		),
	}),
);

export const ClientPaymentMethodsRelations = relations(
	ClientPaymentMethods,
	({ one }) => ({
		client: one(InvoiceClients, {
			fields: [ClientPaymentMethods.clientId],
			references: [InvoiceClients.id],
		}),
	}),
);

export type ClientPaymentMethod = typeof ClientPaymentMethods.$inferSelect;
export type InsertClientPaymentMethod = typeof ClientPaymentMethods.$inferInsert;
