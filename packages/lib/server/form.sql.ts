import { relations } from "drizzle-orm";
import { boolean, index, pgTable, varchar } from "drizzle-orm/pg-core";

import { dbId, primaryId } from "../utils/sql";
import { BioButtons } from "./bio.sql";
import { Events } from "./event.sql";
import { FormResponses } from "./form-response.sql";
import { Workspaces } from "./workspace.sql";

export const Forms = pgTable(
  "Forms",
  {
    // id: cuid('id').notNull(),
    ...primaryId,
    workspaceId: dbId("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    platform: varchar("platform", {
      length: 255,
      enum: ["bio", "meta"],
    }).notNull(),
    title: varchar("title", { length: 255 }),
    subtitle: varchar("subtitle", { length: 255 }),
    messagePrompt: varchar("messagePrompt", { length: 255 }),
    forwardingEmail: varchar("forwardingEmail", { length: 255 }).notNull(),
    forwardingCc: varchar("forwardingCc", { length: 255 }).notNull(),
    inputName: boolean("inputName").notNull(),
    inputEmail: boolean("inputEmail").notNull(),
    inputPhone: boolean("inputPhone").notNull(),
    inputMessage: boolean("inputMessage").notNull(),
  },
  (form) => {
    return {
      // primary: primaryKey(form.workspaceId, form.id),
      workspace: index("Forms_workspace_idx").on(form.workspaceId),
    };
  },
);

export const Form_Relations = relations(Forms, ({ one, many }) => ({
  // one-to-many
  workspace: one(Workspaces, {
    fields: [Forms.workspaceId],
    references: [Workspaces.id],
  }),

  // many-to-one
  bioButtons: many(BioButtons),
  events: many(Events),
  responses: many(FormResponses),
}));
