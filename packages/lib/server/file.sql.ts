import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { cuid, primaryId, timestamps } from "../utils/sql";
import { Tracks } from "./track.sql";
import { Users } from "./user.sql";
import { VidRenders } from "./vid-render.sql";
import { Workspaces } from "./workspace.sql";

export const Files = pgTable(
  "Files",
  {
    // id: cuid('id').notNull(),
    ...primaryId,

    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    ...timestamps,

    type: varchar("type", {
      length: 255,
      enum: ["audio", "video", "image"],
    }).notNull(),
    // type: mysqlEnum('type', ['audio', 'video', 'image']).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    extension: varchar("extension", {
      length: 255,
      enum: ["mp3", "wav", "jpg", "png", "mp4", "mov"],
    }).notNull(),

    description: varchar("description", { length: 255 }),
    url: varchar("url", { length: 255 }).notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    fps: integer("fps"),
    duration: integer("duration"),
    internal: boolean("internal").notNull(),
    metaId: varchar("metaId", { length: 255 }),

    // relations

    createdById: cuid("createdById").notNull(),
    uploadedById: cuid("uploadedById").notNull(),
    trackId: cuid("trackId"),
    thumbnailForId: cuid("thumbnailForId"),
    vidRenderId: cuid("vidRenderId"),
  },
  (table) => ({
    // primary: primaryKey(table.workspaceId, table.id),
    workspace: index("Files_workspace_idx").on(table.workspaceId),
  }),
);

export const File_Relations = relations(Files, ({ one, many }) => ({
  // one-to-one
  thumbnailFor: one(Files, {
    fields: [Files.thumbnailForId],
    references: [Files.id],
  }),
  vidRender: one(VidRenders, {
    fields: [Files.vidRenderId],
    references: [VidRenders.id],
  }),
  createdBy: one(Users, {
    relationName: "filesCreatedByUser",
    fields: [Files.createdById],
    references: [Users.id],
  }),
  workspace: one(Workspaces, {
    fields: [Files.workspaceId],
    references: [Workspaces.id],
  }),
  uploadedBy: one(Users, {
    relationName: "filesUploadedByUser",
    fields: [Files.uploadedById],
    references: [Users.id],
  }),
  track: one(Tracks, {
    fields: [Files.trackId],
    references: [Tracks.id],
  }),

  // many-to-one
  parentForVidRender: many(VidRenders),
}));
