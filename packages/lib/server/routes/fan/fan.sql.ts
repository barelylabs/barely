import { relations } from 'drizzle-orm';
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { Workspaces } from '../workspace/workspace.sql';

export const Fans = pgTable('Fans', {
	...primaryId,
	...timestamps,
	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onDelete: 'cascade',
		}),

	emailMarketingOptIn: boolean('emailMarketingOptIn').default(false).notNull(),
	smsMarketingOptIn: boolean('smsMarketingOptIn').default(false).notNull(),

	// contact info
	fullName: varchar('fullName', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phoneNumber: varchar('phoneNumber', { length: 255 }),

	// shipping address
	shippingAddressLine1: varchar('shippingAddressLine1', { length: 255 }),
	shippingAddressLine2: varchar('shippingAddressLine2', { length: 255 }),
	shippingAddressCity: varchar('shippingAddressCity', { length: 255 }),
	shippingAddressState: varchar('shippingAddressState', { length: 255 }),
	shippingAddressCountry: varchar('shippingAddressCountry', { length: 255 }),
	shippingAddressPostalCode: varchar('shippingAddressPostalCode', { length: 255 }),

	// billing address
	billingAddressPostalCode: varchar('billingAddressPostalCode', { length: 255 }),
	billingAddressCountry: varchar('billingAddressCountry', { length: 255 }),

	// stripe
	stripeCustomerId: varchar('stripeCustomerId', { length: 255 }),
	stripePaymentMethodId: varchar('stripePaymentMethodId', { length: 255 }),
});

export const Fan_Relations = relations(Fans, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Fans.workspaceId],
		references: [Workspaces.id],
	}),
	_paymentMethods: many(_Fans_To_PaymentMethods),
}));

export const _Fans_To_PaymentMethods = pgTable('_Fans_To_PaymentMethods', {
	fanId: dbId('fanId').references(() => Fans.id, {
		onDelete: 'cascade',
	}),
	stripePaymentMethodId: varchar('stripePaymentMethodId', { length: 255 }).notNull(),
});

export const _Fans_To_PaymentMethods_Relations = relations(
	_Fans_To_PaymentMethods,
	({ one }) => ({
		fan: one(Fans, {
			fields: [_Fans_To_PaymentMethods.fanId],
			references: [Fans.id],
		}),
	}),
);
