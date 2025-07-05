import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { primaryId, timestamps } from '../utils';

export const VerificationTokens = pgTable(
	'VerificationTokens',
	{
		...primaryId,
		identifier: varchar('identifier', { length: 255 }).notNull(), // the token itself
		value: text('value').notNull(), // JSON string with email/phone
		expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
		...timestamps,
	},
	vt => ({
		identifier: index('VerificationTokens_identifier_idx').on(vt.identifier),
	}),
);
