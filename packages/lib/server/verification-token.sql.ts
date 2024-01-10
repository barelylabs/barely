import { pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const VerificationTokens = pgTable(
  "VerificationTokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "string" }).notNull(),
  },
  (vt) => ({
    primary: primaryKey(vt.identifier, vt.token),
  }),
);
