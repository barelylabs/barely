import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Users } from './user.sql';

export const UserSessions = pgTable(
	'UserSessions',
	{
		...primaryId,
		expiresAt: timestamp('expiresAt', { mode: 'date' }).notNull(),
		token: varchar('token', { length: 255 }).notNull(),

		// optional fields
		ipAddress: varchar('ipAddress', { length: 255 }),
		userAgent: varchar('userAgent', { length: 255 }),

		// timestamps
		...timestamps,

		// relations
		userId: dbId('userId')
			.notNull()
			.references(() => Users.id, {
				onDelete: 'cascade',
			}),
	},
	session => ({
		token: uniqueIndex('UserSessions_token_key').on(session.token),
		userId: index('UserSessions_userId_idx').on(session.userId),
	}),
);

export const UserSession_Relations = relations(UserSessions, ({ one }) => ({
	// one-to-many
	user: one(Users, {
		fields: [UserSessions.userId],
		references: [Users.id],
	}),
}));
