import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { dbId, primaryId } from "../utils/sql";
import { Campaigns } from "./campaign.sql";
import { Transactions } from "./transaction.sql";

export const TransactionLineItems = pgTable(
  "TransactionLineItems",
  {
    ...primaryId,
    name: varchar("name", { length: 255 }).notNull(),
    paymentType: varchar("paymentType", {
      length: 255,
      enum: ["oneTime", "subscription"],
    }).notNull(),

    setupPrice: integer("setupPrice"),

    subscriptionType: varchar("subscriptionId", {
      length: 255,
      enum: ["pro", "domain", "campaignMaintenance"],
    }),
    subscriptionInterval: varchar("subscriptionInterval", {
      length: 255,
      enum: ["month", "year"],
    }),
    subscriptionPrice: integer("subscriptionPrice"),
    subscriptionPriceDescription: varchar("subscriptionPriceDescription", {
      length: 255,
    }),

    adSpend: integer("adSpend"),
    maintenancePrice: integer("maintenancePrice"),
    maintenancePriceDescription: varchar("maintenancePriceDescription", {
      length: 255,
    }),
    totalDue: integer("totalDue"),
    description: varchar("description", { length: 255 }).notNull(),

    // relations
    transactionId: dbId("transactionId")
      .notNull()
      .references(() => Transactions.id, {
        onDelete: "cascade",
      }),
    campaignId: dbId("campaignId"),
  },
  (lineItem) => ({
    // primary: primaryKey(lineItem.transactionId, lineItem.id),
    transaction: index("LineItems_transaction_idx").on(lineItem.transactionId),
    campaign: index("LineItems_campaign_idx").on(lineItem.campaignId),
  }),
);

export const TransactionLineItem_Relations = relations(
  TransactionLineItems,
  ({ one }) => ({
    // one-to-many
    transaction: one(Transactions, {
      fields: [TransactionLineItems.transactionId],
      references: [Transactions.id],
    }),
    campaign: one(Campaigns, {
      fields: [TransactionLineItems.campaignId],
      references: [Campaigns.id],
    }),
  }),
);
