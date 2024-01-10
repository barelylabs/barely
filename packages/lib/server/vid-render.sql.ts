import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { cuid, primaryId, timestamps } from "../utils/sql";
import { AdCampaigns } from "./ad-campaign.sql";
import { Files } from "./file.sql";
import { TrackRenders } from "./track-render.sql";
import { Users } from "./user.sql";
import { Workspaces } from "./workspace.sql";

export const VidRenders = pgTable(
  "VidRenders",
  {
    ...primaryId,
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
    renderStatus: varchar("renderStatus", {
      length: 255,
      enum: ["queued", "rendering", "failed", "complete"],
    }).notNull(),
    renderFailedError: varchar("renderFailedError", { length: 1000 }),
    compName: varchar("compName", { length: 255 }).notNull(),
    compWidth: integer("compWidth").notNull(),
    compHeight: integer("compHeight").notNull(),
    compDuration: integer("compDuration").notNull(),
    trim: boolean("trim").notNull(),
    trimIn: integer("trimIn").notNull(),
    trimOut: integer("trimOut").notNull(),
    shift: boolean("shift").notNull(),
    shiftX: integer("shiftX").notNull(),
    shiftY: integer("shiftY").notNull(),
    playbackSpeed: integer("playbackSpeed").notNull(),
    addTrack: boolean("addTrack").notNull(),
    addPlaylistTitle: boolean("addPlaylistTitle").notNull(),
    playlistTitle: varchar("playlistTitle", { length: 255 }),
    lambdaRenderId: varchar("lambdaRenderId", { length: 255 }).notNull(),
    lambdaBucket: varchar("lambdaBucket", { length: 255 }).notNull(),
    lambdaFunction: varchar("lambdaFunction", { length: 255 }).notNull(),
    lambdaRegion: varchar("lambdaRegion", { length: 255 }).notNull(),

    // relations
    createdById: cuid("createdById").notNull(),
    adCampaignId: cuid("adCampaignId"),
    trackRenderId: cuid("trackRenderId"),
    parentVidId: cuid("parentVidId"),
  },
  (table) => ({
    // primary: primaryKey(table.workspaceId, table.id),
    workspace: index("VidRenders_workspace_idx").on(table.workspaceId),

    createdBy: index("VidRenders_createdBy_idx").on(table.createdById),
    trackRender: index("VidRenders_trackRender_idx").on(table.trackRenderId),
    parentVid: index("VidRenders_parentVid_idx").on(table.parentVidId),
    adCampaign: index("VidRenders_adCampaign_idx").on(table.adCampaignId),
  }),
);

export const VidRender_Relations = relations(VidRenders, ({ one }) => ({
  // one-to-many
  workspace: one(Workspaces, {
    fields: [VidRenders.workspaceId],
    references: [Workspaces.id],
  }),
  createdBy: one(Users, {
    fields: [VidRenders.createdById],
    references: [Users.id],
  }),
  adCampaign: one(AdCampaigns, {
    fields: [VidRenders.adCampaignId],
    references: [AdCampaigns.id],
  }),
  trackRender: one(TrackRenders, {
    fields: [VidRenders.trackRenderId],
    references: [TrackRenders.id],
  }),
  parentVid: one(Files, {
    fields: [VidRenders.parentVidId],
    references: [Files.id],
  }),
}));
