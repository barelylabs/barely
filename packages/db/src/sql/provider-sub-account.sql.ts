import { relations } from 'drizzle-orm';
import { index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId } from '../utils';
import { ProviderAccounts } from './provider-account.sql';
import { Workspaces } from './workspace.sql';

type ProviderSubAccountType = 'metaAd' | 'metaBusiness' | 'facebookPage';

export const ProviderSubAccounts = pgTable(
	'ProviderSubAccounts',

	{
		...primaryId,
		// basics
		type: varchar('type', { length: 255 }).$type<ProviderSubAccountType>().notNull(),
		providerId: varchar('providerId', { length: 255 }).notNull(),

		// relations
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onDelete: 'cascade',
			}),

		parentAccountId: dbId('userId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
	},
	account => ({
		parentAccount: index('ProviderSubAccounts_parentAccount_idx').on(
			account.parentAccountId,
		),
		type_accountId: uniqueIndex('ProviderSubAccounts_type_accountId_idx').on(
			account.type,
			account.providerId,
		),
		workspace: index('ProviderSubAccounts_workspace_idx').on(account.workspaceId),
	}),
);

export const ProviderSubAccount_Relations = relations(ProviderSubAccounts, ({ one }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [ProviderSubAccounts.workspaceId],
		references: [Workspaces.id],
	}),
	parentProviderAccount: one(ProviderAccounts, {
		relationName: 'providerAccountToSubAccounts',
		fields: [ProviderSubAccounts.parentAccountId],
		references: [ProviderAccounts.id],
	}),
}));
