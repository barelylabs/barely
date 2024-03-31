import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../utils/sql';
import { Links } from './link.sql';
import { Workspaces } from './routes/workspace/workspace.sql';

export const Domains = pgTable(
	'Domains',
	{
		domain: varchar('domain', { length: 255 }).notNull().primaryKey(),
		...timestamps,

		verified: boolean('verified').default(false).notNull(),
		target: varchar('target', { length: 255 }),
		description: varchar('description', { length: 255 }),
		type: varchar('type', {
			length: 10,
			enum: ['bio', 'link', 'press'],
		}).notNull(),

		isPrimaryLinkDomain: boolean('isPrimaryLinkDomain').default(false).notNull(),
		isPrimaryBioDomain: boolean('isPrimaryBioDomain').default(false).notNull(),
		isPrimaryPressDomain: boolean('isPrimaryPressDomain').default(false).notNull(),

		clicks: integer('clicks').default(0).notNull(),
		lastClickedAt: timestamp('lastClickedAt'),
		lastCheckedAt: timestamp('lastCheckedAt').defaultNow(),

		// relations
		workspaceId: varchar('workspaceId', { length: 255 })
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
	},

	domain => ({
		workspace: index('Domains_workspace_idx').on(domain.workspaceId),
		clicked: index('Domains_clicked_idx').on(domain.clicks).desc(),
		lastClickedAt: index('Domains_lastClickedAt_idx').on(domain.lastClickedAt),
		lastCheckedAt: index('Domains_lastCheckedAt_idx').on(domain.lastCheckedAt).asc(),
	}),
);

export const Domain_Relations = relations(Domains, ({ one, many }) => ({
	// one-to-many
	workspace: one(Workspaces, {
		fields: [Domains.workspaceId],
		references: [Workspaces.id],
	}),

	// many-to-one
	links: many(Links),
}));
