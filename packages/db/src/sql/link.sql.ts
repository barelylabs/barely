import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { AdCreatives } from './ad-creative.sql';
import { BioButtons, Bios } from './bio.sql';
import { Domains } from './domain.sql';
import { Events } from './event.sql';
import { Users } from './user.sql';
import { Workspaces } from './workspace.sql';

export const appEnum = [
	'appleMusic',
	'email',
	'facebook',
	'instagram',
	'patreon',
	'snapchat',
	'spotify',
	'tiktok',
	'twitch',
	'twitter',
	'web',
	'whatsapp',
	'youtube',
] as const;

export const Links = pgTable(
	'Links',
	{
		...primaryId,
		workspaceId: dbId('workspaceId')
			.notNull()
			.references(() => Workspaces.id, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),

		...timestamps,

		// link structure
		handle: varchar('handle', { length: 25 })
			.notNull()
			.references(() => Workspaces.handle, {
				onUpdate: 'cascade',
			}),

		/* transparent :: {handle}.barely.link/{app} || {handle}.barely.link/{app}/{appRoute} */
		app: varchar('appId', { length: 25 }),
		appRoute: varchar('appRoute', { length: 100 }),

		// short :: brl.to/{key} || {domain}/{key}
		domain: varchar('domain', { length: 255 })
			.notNull()
			.references(() => Domains.domain, {
				onUpdate: 'cascade',
				onDelete: 'cascade',
			}),
		key: varchar('slug', { length: 50 }).notNull(),

		// destination
		url: varchar('url', { length: 1000 }).notNull(),
		appleScheme: varchar('appleScheme', { length: 1000 }),
		androidScheme: varchar('androidScheme', { length: 1000 }),
		externalAppLinkUrl: varchar('externalAppLinkUrl', { length: 1000 }),

		// custom meta tags
		customMetaTags: boolean('customMetaTags').default(false),
		title: varchar('title', { length: 255 }),
		description: text('description'),
		image: varchar('image', { length: 255 }),
		favicon: varchar('favicon', { length: 255 }),

		// qr code
		qrLight: varchar('qrLight', { length: 255 }).default('white'),
		qrDark: varchar('qrDark', { length: 255 }).default('black'),
		qrText: varchar('qrText', { length: 255 }).default('black'),
		qrLogo: varchar('qrLogo', { length: 255 }),

		// settings
		remarketing: boolean('remarketing').default(false).notNull(),
		transparent: boolean('transparent').default(false).notNull(),

		// internal
		comments: text('comments'),
		showSocialForTeam: boolean('showSocialForTeam').default(false),

		// archive/delete
		archived: boolean('archived').default(false),

		clicks: integer('clicks').default(0),
		publicStats: boolean('publicStats').default(false),

		// relations (+ domain)
		userId: dbId('userId').references(() => Users.id, {
			onUpdate: 'cascade',
			// I don't think we want to delete links when a user is deleted.
		}),
		appLinkId: dbId('appLinkId'),
		bioId: dbId('bioId'),
		socialForTeamId: dbId('socialForTeamId'),
	},

	link => ({
		workspace: index('Link_workspace_idx').on(link.workspaceId),

		bioIdKey: uniqueIndex('Link_bioId_key').on(link.bioId),
		appLinkIdKey: uniqueIndex('Link_appLinkId_key').on(link.appLinkId),
		idAppKey: uniqueIndex('Link_id_app_key').on(link.id, link.app),
		handleDomainAppSlugKey: uniqueIndex('Link_handle_domain_app_slug_key').on(
			link.handle,
			link.domain,
			link.app,
			link.key,
		),
		handleAppAppRoute: uniqueIndex('Link_handle_app_appRoute_key').on(
			link.handle,
			link.app,
			link.appRoute,
		),
		socialForTeamIdAppKey: uniqueIndex('Link_socialForTeamId_appId_key').on(
			link.socialForTeamId,
			link.app,
		), // forces there to be only one social link per app per team
	}),
);

export const LinkRelations = relations(Links, ({ one, many }) => ({
	// one-to-one
	appLink: one(Links, {
		fields: [Links.appLinkId],
		references: [Links.id],
	}),
	bio: one(Bios, {
		fields: [Links.bioId],
		references: [Bios.id],
	}),

	// one-to-many
	domain: one(Domains, {
		relationName: 'domainToLinks',
		fields: [Links.domain],
		references: [Domains.domain],
	}),
	user: one(Users, {
		relationName: 'userToLinks',
		fields: [Links.userId],
		references: [Users.id],
	}),
	workspace: one(Workspaces, {
		relationName: 'teamToLinks',
		fields: [Links.workspaceId, Links.handle],
		references: [Workspaces.id, Workspaces.handle],
	}),
	socialForTeamId: one(Workspaces, {
		relationName: 'teamToSocialLinks',
		fields: [Links.socialForTeamId],
		references: [Workspaces.id],
	}),

	// many-to-one
	adCreatives: many(AdCreatives),
	bioButtons: many(BioButtons),
	events: many(Events),
}));
