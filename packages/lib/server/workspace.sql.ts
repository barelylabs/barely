import { relations } from "drizzle-orm";
import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { cuid, primaryId, timestamps } from "../utils/sql";
import { AdCreatives } from "./ad-creative.sql";
import { AnalyticsEndpoints } from "./analytics-endpoint.sql";
import { Bios } from "./bio.sql";
import { Campaigns } from "./campaign.sql";
import { ExternalWebsites } from "./external-website.sql";
import { Files } from "./file.sql";
import { Forms } from "./form.sql";
import { Links } from "./link.sql";
import { PlaylistCoverRenders } from "./playlist-cover.sql";
import { Playlists } from "./playlist.sql";
import { ProviderAccounts } from "./provider-account.sql";
import { ProviderSubAccounts } from "./provider-sub-account.sql";
import { TrackRenders } from "./track-render.sql";
import { Tracks } from "./track.sql";
import { Transactions } from "./transaction.sql";
import { _Users_To_Workspaces } from "./user.sql";
import { VidRenders } from "./vid-render.sql";

export const Workspaces = pgTable(
  "Workspaces",
  {
    ...primaryId,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    handle: varchar("handle", { length: 255 }).notNull(),
    imageUrl: varchar("imageUrl", { length: 1000 }).unique(),

    type: varchar("type", {
      length: 255,
      enum: ["personal", "creator", "solo_artist", "band", "product"],
    })
      .default("creator")
      .notNull(),

    // artist specific
    spotifyArtistId: varchar("spotifyArtistId", { length: 255 }),

    // billing
    plan: varchar("plan", { length: 10, enum: ["free", "pro", "enterprise"] })
      .default("free")
      .notNull(),
    linkUsage: integer("linkUsage").default(0).notNull(),
    linkUsageLimit: integer("linkUsageLimit").default(1000).notNull(),
    billingCycleStart: integer("billingCycleStart"),

    // relations
    bioRootId: cuid("bioRootId"),
    defaultMetaAdAccountId: varchar("defaultMetaAdAccountId", { length: 255 }),
    defaultSpotifyAccountId: varchar("defaultSpotifyAccountId", {
      length: 255,
    }),
  },

  (workspace) => ({
    handle: uniqueIndex("Workspaces_handle_key").on(workspace.handle),
    spotifyArtistId: uniqueIndex("Workspaces_spotifyArtistId_key").on(
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
  analyticsEndpoints: many(AnalyticsEndpoints),
  bios: many(Bios),
  campaigns: many(Campaigns),
  externalWebsites: many(ExternalWebsites),
  files: many(Files),
  forms: many(Forms),
  links: many(Links, {
    relationName: "teamToLinks",
  }),
  playlists: many(Playlists),
  playlistCoverRenders: many(PlaylistCoverRenders),
  providerAccounts: many(ProviderAccounts),
  providerSubAccounts: many(ProviderSubAccounts),
  socialLinks: many(Links, {
    relationName: "teamToSocialLinks",
  }),
  tracks: many(Tracks),
  trackRenders: many(TrackRenders),
  transactions: many(Transactions),
  vidRenders: many(VidRenders),

  // many-to-many
  _users: many(_Users_To_Workspaces),
}));
