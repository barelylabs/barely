import { relations } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";

import { dbId, primaryId, timestamps } from "../utils/sql";
import { BioButtons, Bios } from "./bio.sql";
import { EventReports } from "./event-report.sql";
import { Forms } from "./form.sql";
import { Links } from "./link.sql";
import { VisitorSessions } from "./visitor-session.sql";

// this should probably be moved to clickhouse/tinybird

export const Events = pgTable(
  "Events",
  {
    ...primaryId,
    ...timestamps,

    type: text("type", {
      enum: [
        "pageView",
        "linkClick",
        "formOpen",
        "formSubmit",
        "presaveSpotifyOpen",
        "presaveSpotifyComplete",
      ],
    }).notNull(),

    // relations
    linkId: dbId("linkId"),
    bioId: dbId("bioId"),
    bioButtonId: dbId("bioButtonId"),
    formId: dbId("formId"),
    visitorSessionId: dbId("visitorSessionId"),
  },
  (event) => ({
    bio: index("Events_bio_idx").on(event.bioId),
    bio_BioButton: index("Events_bio_bioButton_idx").on(
      event.bioId,
      event.bioButtonId,
    ),
    form: index("Events_form_idx").on(event.formId),
    link: index("Events_link_idx").on(event.linkId),
    visitorSession: index("Events_visitorSession_idx").on(
      event.visitorSessionId,
    ),
  }),
);

export const Event_Relations = relations(Events, ({ one, many }) => ({
  // one-to-many
  link: one(Links, {
    fields: [Events.linkId],
    references: [Links.id],
  }),
  bio: one(Bios, {
    fields: [Events.bioId],
    references: [Bios.id],
  }),
  bioButton: one(BioButtons, {
    fields: [Events.bioButtonId],
    references: [BioButtons.id],
  }),
  form: one(Forms, {
    fields: [Events.formId],
    references: [Forms.id],
  }),
  visitorSession: one(VisitorSessions, {
    fields: [Events.visitorSessionId],
    references: [VisitorSessions.id],
  }),

  // many-to-one
  eventReports: many(EventReports),
}));
