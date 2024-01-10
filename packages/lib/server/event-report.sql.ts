import { relations } from "drizzle-orm";
import { index, pgTable, varchar } from "drizzle-orm/pg-core";

import { cuid, primaryId, timestamps } from "../utils/sql";
import { AnalyticsEndpoints } from "./analytics-endpoint.sql";
import { Events } from "./event.sql";

export const EventReports = pgTable(
  "EventReports",
  {
    ...primaryId,
    ...timestamps,

    error: varchar("error", { length: 1000 }),

    // relations
    eventId: cuid("eventId").notNull(),
    analyticsPlatform: varchar("analyticsPlatform", {
      length: 100,
      enum: ["meta", "google", "tiktok", "snapchat"],
    }).notNull(),
    analyticsId: cuid("analyticsId").notNull(),
  },
  (table) => {
    return {
      event: index("EventReports_event_idx").on(table.eventId),
    };
  },
);

export const EventReportRelations = relations(EventReports, ({ one }) => ({
  // one-to-many
  event: one(Events, {
    fields: [EventReports.eventId],
    references: [Events.id],
  }),
  analyticsEndpoint: one(AnalyticsEndpoints, {
    fields: [EventReports.analyticsPlatform, EventReports.analyticsId],
    references: [AnalyticsEndpoints.platform, AnalyticsEndpoints.id],
  }),
}));
