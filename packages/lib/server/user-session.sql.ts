import { relations } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { cuid } from '../utils/sql';
import { Users } from './user.sql';

export const UserSessions = pgTable('UserSessions', {
	sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
	expires: timestamp('expires', { mode: 'string' }).notNull(),

	// relations
	userId: cuid('userId')
		.notNull()
		.references(() => Users.id, {
			onDelete: 'cascade',
		}),
});

export const UserSession_Relations = relations(UserSessions, ({ one }) => ({
	// one-to-many
	user: one(Users, {
		fields: [UserSessions.userId],
		references: [Users.id],
	}),
}));
