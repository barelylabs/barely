import { relations } from "drizzle-orm";
import { pgTable, primaryKey, text, varchar } from "drizzle-orm/pg-core";

import { cuid, id, timestamps } from "../utils/sql";
import { Forms } from "./form.sql";

export const FormResponses = pgTable(
  "FormResponses",
  {
    ...id,
    ...timestamps,
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    message: varchar("message", { length: 1000 }),

    // relations
    formId: cuid("formId")
      .notNull()
      .references(() => Forms.id, {
        onDelete: "cascade",
      }),
  },
  (formResponse) => {
    return {
      primary: primaryKey(formResponse.formId, formResponse.id),
    };
  },
);

export const FormResponse_Relations = relations(FormResponses, ({ one }) => ({
  // one-to-many
  form: one(Forms, {
    fields: [FormResponses.formId],
    references: [Forms.id],
  }),
}));
