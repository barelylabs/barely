import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { cuid, primaryId, timestamps } from "../utils/sql";
import { AdCampaigns } from "./ad-campaign.sql";
import { Ads } from "./ad.sql";
import { Audiences } from "./audience.sql";
import { Workspaces } from "./workspace.sql";

export const AdSets = pgTable(
  "AdSets",
  {
    ...primaryId,
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    ...timestamps,

    metaId: varchar("metaId", { length: 255 }),
    fbFeed: boolean("fbFeed").notNull(),
    fbVideoFeeds: boolean("fbVideoFeeds").notNull(),
    fbMarketplace: boolean("fbMarketplace").notNull(),
    fbStories: boolean("fbStories").notNull(),
    igFeed: boolean("igFeed").notNull(),
    igStories: boolean("igStories").notNull(),
    igReels: boolean("igReels").notNull(),
    tiktokFeed: boolean("tiktokFeed").notNull(),
    metaStatus: varchar("metaStatus", {
      length: 255,
      enum: ["ACTIVE", "PAUSED", "ERROR"],
    }).notNull(),
    tiktokId: varchar("tiktokId", { length: 255 }),
    tiktokStatus: varchar("tiktokStatus", {
      length: 255,
      enum: ["ACTIVE", "PAUSED", "ERROR"],
    }).notNull(),

    // relations
    adCampaignId: cuid("adCampaignId").notNull(),
    audienceId: cuid("audienceId").notNull(),
    adSetParentId: cuid("adSetParentId"),
  },
  (table) => ({
    // primary: primaryKey(table.workspaceId, table.id),
    workspace: index("AdSets_workspace_idx").on(table.workspaceId),
    adCampaign: index("AdSets_adCampaign_idx").on(table.adCampaignId),
    audience: index("AdSets_audience_idx").on(table.audienceId),
  }),
);

export const AdSet_Relations = relations(AdSets, ({ one, many }) => ({
  // one-to-many
  audience: one(Audiences, {
    fields: [AdSets.audienceId],
    references: [Audiences.id],
  }),
  adCampaign: one(AdCampaigns, {
    fields: [AdSets.adCampaignId],
    references: [AdCampaigns.id],
  }),
  adSetParent: one(AdSets, {
    relationName: "adSetParentToChild",
    fields: [AdSets.adSetParentId],
    references: [AdSets.id],
  }),

  adSetCloneRecord_ChildOfClone: many(AdSetCloneRecords, {
    relationName: "adSetCloneRecord_ChildOfClone",
  }),

  // many-to-one
  ads: many(Ads),
  adSetChildren: many(AdSets, { relationName: "adSetParentToChild" }),

  adSetCloneRecord_ParentForClone: one(AdSetCloneRecords, {
    relationName: "adSetCloneRecord_ParentForClone",
    fields: [AdSets.id],
    references: [AdSetCloneRecords.adSetParentId],
  }),

  adSetUpdateRecords: many(AdSetUpdateRecords),
}));

// 🐑 ad set clones

export const AdSetCloneRecords = pgTable(
  "AdSetCloneRecords",
  {
    ...primaryId,
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
    meta: boolean("meta").notNull(),
    metaStatus: varchar("metaStatus", {
      length: 255,
      enum: ["ACTIVE", "PAUSED", "ERROR"],
    }).notNull(),
    metaComplete: boolean("metaComplete").notNull(),

    tiktok: boolean("tiktok").notNull(),
    tiktokComplete: boolean("tiktokComplete").notNull(),

    dailyBudget: integer("dailyBudget"),

    // relations
    audienceId: cuid("audienceId"),
    adSetParentId: cuid("adSetParentId").notNull(),
    adSetChildId: cuid("adSetChildId"),
  },
  (table) => ({
    // primary: primaryKey({
    //   name: "adsetclonerecords_workspaceid_adsetparentid_id_pk",
    //   columns: [table.workspaceId, table.adSetParentId, table.id],
    // }),

    audience: index("AdSetCloneRecords_audience_idx").on(table.audienceId),
    adSetParent: index("AdSetCloneRecord_adSetParent_idx").on(
      table.adSetParentId,
    ),
    adSetChild: index("AdSetCloneRecord_adSetChild_idx").on(table.adSetChildId),
  }),
);

export const AdSetCloneRecord_Relations = relations(
  AdSetCloneRecords,
  ({ one }) => ({
    // one-to-one
    adSetChild: one(AdSets, {
      relationName: "adSetCloneRecord_ChildOfClone",
      fields: [AdSetCloneRecords.adSetChildId],
      references: [AdSets.id],
    }),

    // one-to-many
    audience: one(Audiences, {
      fields: [AdSetCloneRecords.audienceId],
      references: [Audiences.id],
    }),
    adSetParent: one(AdSets, {
      relationName: "adSetCloneRecord_ParentForClone",
      fields: [AdSetCloneRecords.adSetParentId],
      references: [AdSets.id],
    }),
  }),
);

// 📝 ad set updates

export const AdSetUpdateRecords = pgTable(
  "AdSetUpdateRecords",
  {
    ...primaryId,
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamps.createdAt,
    metaComplete: boolean("metaComplete"),
    metaStatus: varchar("metaStatus", {
      length: 255,
      enum: ["ACTIVE", "PAUSED", "ERROR"],
    }),
    tiktokComplete: boolean("tiktokComplete"),

    dailyBudget: integer("dailyBudget"),

    // relations
    adSetId: cuid("adSetId").notNull(),
    audienceId: cuid("audienceId"),
  },
  (table) => ({
    adSet: index("AdSetUpdateRecords_adSet_idx").on(table.adSetId),
    audience: index("AdSetUpdateRecord_audience_idx").on(table.audienceId),
  }),
);

export const AdSetUpdateRecord_Relations = relations(
  AdSetUpdateRecords,
  ({ one }) => ({
    // one-to-many
    adSet: one(AdSets, {
      fields: [AdSetUpdateRecords.adSetId],
      references: [AdSets.id],
    }),
    audience: one(Audiences, {
      fields: [AdSetUpdateRecords.audienceId],
      references: [Audiences.id],
    }),
  }),
);
