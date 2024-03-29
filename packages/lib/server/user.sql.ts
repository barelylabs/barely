import { relations } from 'drizzle-orm';
import {
	boolean,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils/sql';
import { Campaigns, CampaignUpdateRecords } from './campaign.sql';
import { Files } from './file.sql';
import { PlaylistCoverRenders } from './playlist-cover.sql';
import { PlaylistPitchReviews } from './playlist-pitch-review.sql';
import { ProviderAccounts } from './provider-account.sql';
import { TrackRenders } from './track-render.sql';
import { Transactions } from './transaction.sql';
import { UserSessions } from './user-session.sql';
import { VidRenders } from './vid-render.sql';
import { Workspaces } from './workspace.sql';

export const Users = pgTable(
	'Users',
	{
		// auth.js fields
		...primaryId,
		firstName: varchar('firstName', { length: 255 }),
		lastName: varchar('lastName', { length: 255 }),
		fullName: varchar('name', { length: 255 }),
		email: varchar('email', { length: 255 }).notNull(),
		emailVerified: timestamp('emailVerified', { mode: 'string' }),
		phone: varchar('phone', { length: 255 }),
		phoneVerified: timestamp('phoneVerified', { mode: 'string' }),

		// custom fields
		...timestamps,
		marketing: boolean('marketing').default(false),
		pitchScreening: boolean('pitchScreening').default(false),
		pitchReviewing: boolean('pitchReviewing').default(false),
		personalWorkspaceId: dbId('personalWorkspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),
		handle: varchar('handle', { length: 255 })
			// .notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),
		image: varchar('image', { length: 1000 }).references(() => Workspaces.imageUrl, {
			onUpdate: 'cascade',
		}),
		stripeId: varchar('stripeId', { length: 255 }), // deprecated
		stripeId_devMode: varchar('stripeId_devMode', { length: 255 }),
	},

	user => ({
		email: uniqueIndex('Users_email_key').on(user.email),
		phone: uniqueIndex('Users_phone_key').on(user.phone),
		personalWorkspace: uniqueIndex('Users_personalWorkspaceId_key').on(
			user.personalWorkspaceId,
		),
	}),
);

export const UserRelations = relations(Users, ({ one, many }) => ({
	// one-to-one
	personalWorkspace: one(Workspaces, {
		fields: [Users.personalWorkspaceId, Users.handle],
		references: [Workspaces.id, Workspaces.handle],
	}),

	// many-to-one
	campaignUpdateRecords: many(CampaignUpdateRecords),
	campaignsCreated: many(Campaigns),
	filesCreated: many(Files, {
		relationName: 'filesCreatedByUser',
	}),
	filesUploaded: many(Files, {
		relationName: 'filesUploadedByUser',
	}),
	playlistCoverRendersCreated: many(PlaylistCoverRenders),
	playlistPitchReviews: many(PlaylistPitchReviews),
	providerAccounts: many(ProviderAccounts),
	trackRendersCreated: many(TrackRenders),
	transactions: many(Transactions),
	userSessions: many(UserSessions),
	vidRenders: many(VidRenders),

	// many-to-many
	_workspaces: many(_Users_To_Workspaces),
}));

// join tables

export const _Users_To_Workspaces = pgTable(
	'_Users_To_Workspaces',
	{
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, { onDelete: 'cascade' }),
		userId: dbId('userId')
			.notNull()
			.references(() => Users.id, { onDelete: 'cascade' }),

		role: varchar('role', {
			length: 255,
			enum: ['owner', 'admin', 'member'],
		})
			.default('member')
			.notNull(),
	},
	userToWorkspace => ({
		primaryKey: primaryKey({
			columns: [userToWorkspace.workspaceId, userToWorkspace.userId],
		}),
	}),
);

export const _Users_To_Workspaces_Relations = relations(
	_Users_To_Workspaces,
	({ one }) => ({
		workspace: one(Workspaces, {
			fields: [_Users_To_Workspaces.workspaceId],
			references: [Workspaces.id],
		}),
		user: one(Users, {
			fields: [_Users_To_Workspaces.userId],
			references: [Users.id],
		}),
	}),
);
