import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { cuid } from "../utils/sql";
import { EventReports } from "./event-report.sql";
import { Workspaces } from "./workspace.sql";

export const AnalyticsEndpoints = pgTable(
  "AnalyticsEndpoints",
  {
    id: varchar("id", { length: 255 }).notNull(), // we'll use the id the platform gives us
    platform: varchar("platform", {
      length: 255,
      enum: ["meta", "google", "tiktok", "snapchat"],
    }).notNull(),
    accessToken: varchar("accessToken", { length: 255 }),

    // relations
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },
  (endpoint) => {
    return {
      primary: primaryKey(endpoint.platform, endpoint.id),
      workspacePlatform: uniqueIndex("workspace_platform_idx").on(
        endpoint.workspaceId,
        endpoint.platform,
      ),
    };
  },
);

export const AnalyticsEndpoint_Relations = relations(
  AnalyticsEndpoints,
  ({ one, many }) => ({
    // one-to-many
    workspace: one(Workspaces, {
      fields: [AnalyticsEndpoints.workspaceId],
      references: [Workspaces.id],
    }),

    // many-to-one
    eventReports: many(EventReports),
  }),
);
