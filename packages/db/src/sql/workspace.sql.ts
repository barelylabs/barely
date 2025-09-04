import { WORKSPACE_PLAN_TYPES, WORKSPACE_TIMEZONES } from '@barely/const';
import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../utils';
import { AdCreatives } from './ad-creative.sql';
import { Albums } from './album.sql';
import { AnalyticsEndpoints } from './analytics-endpoint.sql';
import { Bios } from './bio.sql';
import { BrandKits } from './brand-kit.sql';
import { Campaigns } from './campaign.sql';
import { ExternalWebsites } from './external-website.sql';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
	Files,
} from './file.sql';
import { Forms } from './form.sql';
import { Links } from './link.sql';
import { Mixtapes } from './mixtape.sql';
import { PlaylistCoverRenders } from './playlist-cover.sql';
import { Playlists } from './playlist.sql';
import { PressKits } from './press-kit.sql';
import { ProviderAccounts } from './provider-account.sql';
import { ProviderSubAccounts } from './provider-sub-account.sql';
import { TrackRenders } from './track-render.sql';
import { Tracks } from './track.sql';
import { Transactions } from './transaction.sql';
import { _Users_To_Workspaces } from './user.sql';
import { VidRenders } from './vid-render.sql';
import { WorkspaceInvites } from './workspace-invite.sql';

export const Workspaces = pgTable(
	'Workspaces',
	{
		...primaryId,
		...timestamps,
		name: varchar('name', { length: 255 }).notNull(),
		handle: varchar('handle', { length: 255 }).notNull(),

		// imageUrl: varchar('imageUrl', { length: 1000 }).unique(), // deprecated in favor of avatarImages - remove in future

		type: varchar('type', {
			length: 255,
			enum: ['personal', 'creator', 'solo_artist', 'band', 'product'],
		})
			.default('creator')
			.notNull(),

		// used in pressKits and bios
		bio: text('bio'), // markdown
		bookingTitle: varchar('bookingTitle', { length: 255 }),
		bookingName: varchar('bookingName', { length: 255 }),
		bookingEmail: varchar('bookingEmail', { length: 255 }),

		// theme
		brandHue: integer('brandHue').notNull().default(30),
		brandAccentHue: integer('brandAccentHue').notNull().default(200),

		// feature flags
		feature__tracks: boolean('feature__tracks').default(false).notNull(),
		feature__mixtapes: boolean('feature__mixtapes').default(false).notNull(),
		feature__pressKits: boolean('feature__pressKits').default(false).notNull(),

		// artist specific
		spotifyArtistId: varchar('spotifyArtistId', { length: 255 }),
		youtubeChannelId: varchar('youtubeChannelId', { length: 255 }),
		tiktokUsername: varchar('tiktokUsername', { length: 255 }),
		instagramUsername: varchar('instagramUsername', { length: 255 }),
		website: varchar('website', { length: 255 }),

		spotifyPopularity: integer('spotifyPopularity'),
		spotifyFollowers: integer('spotifyFollowers'),
		spotifyMonthlyListeners: integer('spotifyMonthlyListeners'),
		youtubeSubscribers: integer('youtubeSubscribers'),
		tiktokFollowers: integer('tiktokFollowers'),
		instagramFollowers: integer('instagramFollowers'),
		twitterFollowers: integer('twitterFollowers'),
		facebookFollowers: integer('facebookFollowers'),

		//
		timezone: text('timezone', { enum: WORKSPACE_TIMEZONES })
			.notNull()
			.default('America/New_York'),

		// billing
		stripeCustomerId: varchar('stripeCustomerId', { length: 255 }),
		stripeCustomerId_devMode: varchar('stripeCustomerId_devMode', {
			length: 255,
		}),
		stripeConnectAccountId: varchar('stripeConnectAccountId', { length: 255 }),
		stripeConnectAccountId_devMode: varchar('stripeConnectAccountId_devMode', {
			length: 255,
		}),
		stripeConnectChargesEnabled: boolean('stripeConnectChargesEnabled').default(false),
		stripeConnectChargesEnabled_devMode: boolean(
			'stripeConnectChargesEnabled_devMode',
		).default(false),

		// Stripe Connect status tracking
		stripeConnectOnboardingStartedAt: timestamp('stripeConnectOnboardingStartedAt'),
		stripeConnectDetailsSubmitted: boolean('stripeConnectDetailsSubmitted').default(
			false,
		),
		stripeConnectDetailsSubmitted_devMode: boolean(
			'stripeConnectDetailsSubmitted_devMode',
		).default(false),
		stripeConnectPayoutsEnabled: boolean('stripeConnectPayoutsEnabled').default(false),
		stripeConnectPayoutsEnabled_devMode: boolean(
			'stripeConnectPayoutsEnabled_devMode',
		).default(false),
		stripeConnectLastStatusCheck: timestamp('stripeConnectLastStatusCheck'),

		billingCycleStart: integer('billingCycleStart'),
		plan: varchar('plan', {
			length: 20,
			enum: WORKSPACE_PLAN_TYPES,
		})
			.default('free')
			.notNull(),

		/* event usage */
		eventUsage: integer('eventUsage').default(0).notNull(),
		eventUsageLimitOverride: integer('eventUsageLimitOverride'),

		/* email usage */
		emailUsage: integer('emailUsage').default(0).notNull(),
		emailUsageLimitOverride: integer('emailUsageLimitOverride'),

		/* link usage */
		linkUsage: integer('linkUsage').default(0).notNull(),
		linkUsageLimit: integer('linkUsageLimit').default(1000).notNull(),
		linkUsageLimitOverride: integer('linkUsageLimitOverride'),

		/* invoice usage */
		invoiceUsage: integer('invoiceUsage').default(0).notNull(),
		invoiceUsageLimit: integer('invoiceUsageLimit').default(3).notNull(),
		invoiceUsageLimitOverride: integer('invoiceUsageLimitOverride'),

		/* file storage */
		fileUsage_total: integer('fileUsage_total').default(0).notNull(),
		fileUsage_billingCycle: integer('fileUsage_billingCycle').default(0).notNull(),
		fileUsageLimit_total: integer('fileUsageLimit_total')
			.default(200000000) // 200MB
			.notNull(),
		fileUsageLimit_billingCycle: integer('fileUsageLimit_billingCycle')
			.default(200000000) // 200MB
			.notNull(),

		/* general support email */
		supportEmail: varchar('supportEmail', { length: 255 }), // this can be set once and used as a fallback for all other support emails

		/* invoice */
		invoiceSupportEmail: varchar('invoiceSupportEmail', { length: 255 }),

		/* cart */
		cartSupportEmail: varchar('cartSupportEmail', { length: 255 }),
		cartFeePercentageOverride: integer('cartFeePercentageOverride'),

		/* vip */
		vipSupportEmail: varchar('vipSupportEmail', { length: 255 }),

		/* for shipping */
		shippingAddressLine1: varchar('shippingAddressLine1', { length: 255 }),
		shippingAddressLine2: varchar('shippingAddressLine2', { length: 255 }),
		shippingAddressCity: varchar('shippingAddressCity', { length: 255 }),
		shippingAddressState: varchar('shippingAddressState', { length: 255 }),
		shippingAddressPostalCode: varchar('shippingAddressPostalCode', { length: 255 }),
		shippingAddressCountry: varchar('shippingAddressCountry', { length: 255 }),

		// relations
		bioRootId: dbId('bioRootId'),
		defaultMetaAdAccountId: varchar('defaultMetaAdAccountId', { length: 255 }),
		defaultSpotifyAccountId: varchar('defaultSpotifyAccountId', {
			length: 255,
		}),

		orders: integer('orders').default(0).notNull(),
		currency: varchar('currency', { length: 4, enum: ['usd', 'gbp'] })
			.default('usd')
			.notNull(),
	},

	workspace => ({
		handle: uniqueIndex('workspaces_handle_key').on(workspace.handle),
		spotifyArtistId: uniqueIndex('Workspaces_spotifyArtistId_key').on(
			workspace.spotifyArtistId,
		),
	}),
);

export const WorkspaceRelations = relations(Workspaces, ({ one, many }) => ({
	// one-to-one
	bioRoot: one(Bios, {
		fields: [Workspaces.bioRootId],
		references: [Bios.id],
	}),
	brandKit: one(BrandKits),
	defaultMetaAdAccount: one(ProviderAccounts, {
		fields: [Workspaces.defaultMetaAdAccountId],
		references: [ProviderAccounts.providerAccountId],
	}),
	defaultSpotifyAccount: one(ProviderAccounts, {
		fields: [Workspaces.defaultSpotifyAccountId],
		references: [ProviderAccounts.providerAccountId],
	}),

	// many-to-one
	adCreatives: many(AdCreatives),
	albums: many(Albums),
	analyticsEndpoints: many(AnalyticsEndpoints),
	_avatarImages: many(_Files_To_Workspaces__AvatarImage),
	_headerImages: many(_Files_To_Workspaces__HeaderImage),

	bios: many(Bios),
	campaigns: many(Campaigns),
	externalWebsites: many(ExternalWebsites),
	files: many(Files),
	forms: many(Forms),
	invites: many(WorkspaceInvites),
	links: many(Links, {
		relationName: 'teamToLinks',
	}),
	mixtapes: many(Mixtapes),
	playlists: many(Playlists),
	playlistCoverRenders: many(PlaylistCoverRenders),
	pressKits: many(PressKits),
	providerAccounts: many(ProviderAccounts),
	providerSubAccounts: many(ProviderSubAccounts),
	socialLinks: many(Links, {
		relationName: 'teamToSocialLinks',
	}),
	tracks: many(Tracks),
	trackRenders: many(TrackRenders),
	transactions: many(Transactions),
	vidRenders: many(VidRenders),

	// many-to-many
	_users: many(_Users_To_Workspaces),
}));
