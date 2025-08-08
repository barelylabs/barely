import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { Files } from './file.sql';
import { Workspaces } from './workspace.sql';

export const VIP_SWAP_TYPES = ['contact', 'presave', 'presave-forever'] as const;
export type VipSwapType = (typeof VIP_SWAP_TYPES)[number];

export const VipSwaps = pgTable(
	'VipSwaps',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),
		handle: varchar('handle', { length: 255 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),

		...timestamps,

		// Basic Info
		name: varchar('name', { length: 255 }).notNull(),
		key: varchar('key', { length: 255 }).notNull(),
		type: varchar('type', { length: 20, enum: VIP_SWAP_TYPES })
			.notNull()
			.default('contact'),
		description: varchar('description', { length: 1000 }),

		// Files
		fileId: dbId('fileId')
			.notNull()
			.references(() => Files.id, {
				onDelete: 'restrict',
			}),
		coverImageId: dbId('coverImageId').references(() => Files.id, {
			onDelete: 'set null',
		}),

		// Email Capture Settings
		emailCaptureTitle: varchar('emailCaptureTitle', { length: 255 }),
		emailCaptureDescription: varchar('emailCaptureDescription', { length: 1000 }),
		emailCaptureLabel: varchar('emailCaptureLabel', { length: 255 }),

		// Download Page Settings
		downloadTitle: varchar('downloadTitle', { length: 255 }),

		// Email Settings
		emailFromName: varchar('emailFromName', { length: 255 }),
		emailSubject: varchar('emailSubject', { length: 255 }),
		emailBody: varchar('emailBody', { length: 2000 }),

		// Status
		isActive: boolean('isActive').notNull().default(true),
		expiresAt: timestamp('expiresAt'),

		// Stats
		downloadCount: integer('downloadCount').notNull().default(0),
		emailCount: integer('emailCount').notNull().default(0),
		pageViewCount: integer('pageViewCount').notNull().default(0),

		// Attribution
		cartProductId: dbId('cartProductId'),
		marketingCampaignId: dbId('marketingCampaignId'),

		// Security
		downloadLimit: integer('downloadLimit').default(10), // max downloads per email
		passwordProtected: boolean('passwordProtected').notNull().default(false),
		password: varchar('password', { length: 255 }),
		downloadLinkExpiryMinutes: integer('downloadLinkExpiryMinutes').default(1440), // 24 hours default
	},
	swap => ({
		workspace: index('VipSwaps_workspaceId_key').on(swap.workspaceId),
		key: uniqueIndex('VipSwaps_key_key').on(swap.key),
		workspace_key: uniqueIndex('VipSwaps_workspace_key_key').on(
			swap.workspaceId,
			swap.key,
		),
		isActive: index('VipSwaps_isActive_key').on(swap.isActive),
		expiresAt: index('VipSwaps_expiresAt_key').on(swap.expiresAt),
		// Composite index for active swaps lookup by handle and key
		handle_key_active: index('VipSwaps_handle_key_active').on(
			swap.handle,
			swap.key,
			swap.isActive,
		),
	}),
);

export const VipSwaps_Relations = relations(VipSwaps, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [VipSwaps.workspaceId],
		references: [Workspaces.id],
	}),
	file: one(Files, {
		fields: [VipSwaps.fileId],
		references: [Files.id],
	}),
	coverImage: one(Files, {
		fields: [VipSwaps.coverImageId],
		references: [Files.id],
	}),
	accessLogs: many(VipSwapAccessLogs),
}));

export const VipSwapAccessLogs = pgTable(
	'VipSwapAccessLogs',
	{
		...primaryId,

		vipSwapId: dbId('vipSwapId')
			.notNull()
			.references(() => VipSwaps.id, {
				onDelete: 'cascade',
			}),

		...timestamps,

		// User Info
		email: varchar('email', { length: 255 }).notNull(),
		ipAddress: varchar('ipAddress', { length: 45 }),
		userAgent: varchar('userAgent', { length: 1000 }),

		// Access Type
		accessType: varchar('accessType', { length: 50 }).notNull(), // 'download', 'email_sent', 'page_view'

		// Download Token (for secure download links)
		downloadToken: varchar('downloadToken', { length: 255 }),
		downloadTokenExpiresAt: timestamp('downloadTokenExpiresAt'),
		downloadedAt: timestamp('downloadedAt'),

		// Attribution
		referrer: varchar('referrer', { length: 1000 }),
		utmSource: varchar('utmSource', { length: 255 }),
		utmMedium: varchar('utmMedium', { length: 255 }),
		utmCampaign: varchar('utmCampaign', { length: 255 }),
		utmTerm: varchar('utmTerm', { length: 255 }),
		utmContent: varchar('utmContent', { length: 255 }),

		// Email Provider Integration
		emailProviderId: varchar('emailProviderId', { length: 255 }), // Convertkit subscriber ID, etc
		emailProviderName: varchar('emailProviderName', { length: 100 }), // 'convertkit', 'mailchimp', etc
	},
	log => ({
		vipSwap: index('VipSwapAccessLogs_vipSwapId_key').on(log.vipSwapId),
		email: index('VipSwapAccessLogs_email_key').on(log.email),
		accessType: index('VipSwapAccessLogs_accessType_key').on(log.accessType),
		downloadToken: uniqueIndex('VipSwapAccessLogs_downloadToken_key').on(
			log.downloadToken,
		),
		vipSwap_email: index('VipSwapAccessLogs_vipSwap_email_key').on(
			log.vipSwapId,
			log.email,
		),
		// Composite index for email + accessType queries (for download limit checks)
		email_accessType: index('VipSwapAccessLogs_email_accessType').on(
			log.email,
			log.accessType,
		),
		// Composite index for vipSwap + email + accessType (most common query pattern)
		vipSwap_email_accessType: index('VipSwapAccessLogs_vipSwap_email_accessType').on(
			log.vipSwapId,
			log.email,
			log.accessType,
		),
	}),
);

export const VipSwapAccessLogs_Relations = relations(VipSwapAccessLogs, ({ one }) => ({
	vipSwap: one(VipSwaps, {
		fields: [VipSwapAccessLogs.vipSwapId],
		references: [VipSwaps.id],
	}),
}));
