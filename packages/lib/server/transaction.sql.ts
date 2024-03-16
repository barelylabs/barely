import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { dbId, primaryId, timestamps } from "../utils/sql";
import { TransactionLineItems } from "./transaction-line-item.sql";
import { Users } from "./user.sql";
import { Workspaces } from "./workspace.sql";

export const Transactions = pgTable(
  "Transactions",
  {
    ...primaryId,
    workspaceId: dbId("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
    completedAt: timestamp("completedAt", { mode: "string" }),
    type: varchar("type", { length: 255 }),
    amount: integer("amount").notNull(), // cents
    description: varchar("description", { length: 255 }),
    status: varchar("status", {
      length: 255,
      enum: ["created", "pending", "succeeded", "failed"],
    }).notNull(),
    stripeId: varchar("stripeId", { length: 255 }),
    stripeClientSecret: varchar("stripeClientSecret", { length: 255 }),
    stripeMetadata: json("stripeMetadata"),
    stripeLiveMode: boolean("stripeLiveMode").default(false).notNull(),
    checkoutLink: varchar("checkoutLink", { length: 255 }),

    // relations
    createdById: dbId("createdById"),
  },
  (transaction) => ({
    // primary: primaryKey(transaction.workspaceId, transaction.id),
    workspace: index("Transactions_workspace_idx").on(transaction.workspaceId),
    createdBy: index("Transactions_createdBy_idx").on(transaction.createdById),
  }),
);

export const Transaction_Relations = relations(
  Transactions,
  ({ one, many }) => ({
    // one-to-many
    createdBy: one(Users, {
      fields: [Transactions.createdById],
      references: [Users.id],
    }),
    team: one(Workspaces, {
      fields: [Transactions.workspaceId],
      references: [Workspaces.id],
    }),

    // many-to-one
    lineItems: many(TransactionLineItems),
  }),
);
