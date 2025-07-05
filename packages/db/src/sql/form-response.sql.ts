import { relations } from 'drizzle-orm';
import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Forms } from './form.sql';

export const FormResponses = pgTable(
	'FormResponses',
	{
		...primaryId,
		...timestamps,
		name: text('name'),
		email: text('email'),
		phone: text('phone'),
		message: varchar('message', { length: 1000 }),

		// relations
		formId: dbId('formId')
			.notNull()
			.references(() => Forms.id, {
				onDelete: 'cascade',
			}),
	},
	formResponse => {
		return {
			form: index('FormResponses_form_idx').on(formResponse.formId),
		};
	},
);

export const FormResponse_Relations = relations(FormResponses, ({ one }) => ({
	// one-to-many
	form: one(Forms, {
		fields: [FormResponses.formId],
		references: [Forms.id],
	}),
}));
