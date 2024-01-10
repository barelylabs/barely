import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { cuid, primaryId } from "../utils/sql";
import { AdCreatives } from "./ad-creative.sql";
import { _Playlists_To_ProviderAccounts } from "./playlist.sql";
import { ProviderSubAccounts } from "./provider-sub-account.sql";
import { Stats } from "./stat.sql";
import { Users } from "./user.sql";
import { Workspaces } from "./workspace.sql";

export const providersEnum = [
  "discord",
  "facebook",
  "google",
  "spotify",
  "tiktok",
] as const;

export type Provider = (typeof providersEnum)[number];

export const ProviderAccounts = pgTable(
  "ProviderAccounts",
  {
    ...primaryId,

    // relations
    userId: cuid("userId")
      .notNull()
      .references(() => Users.id, {
        onDelete: "cascade",
      }),
    workspaceId: cuid("workspaceId")
      .notNull()
      .references(() => Workspaces.id, {}),

    // basics
    type: varchar("type", { length: 255, enum: ["oauth", "email"] }).notNull(),
    provider: varchar("provider", {
      length: 255,
      enum: providersEnum,
    }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),

    // token management
    refresh_token: varchar("refresh_token", { length: 2000 }),
    access_token: varchar("access_token", { length: 2000 }),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 2000 }),
    id_token: varchar("id_token", { length: 255 }),
    session_state: varchar("session_state", { length: 255 }),

    // custom
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }),
    image: varchar("image", { length: 255 }),
    externalProfileUrl: varchar("externalLink", { length: 255 }),
  },
  (account) => ({
    provider_providerAccountId: uniqueIndex(
      "ProviderAccounts_provider_providerAccountId_idx",
    ).on(account.provider, account.providerAccountId),
    workspace: index("ProviderAccounts_workspace_idx").on(account.workspaceId),
  }),
);

export const ProviderAccounts_Relations = relations(
  ProviderAccounts,
  ({ one, many }) => ({
    // one-to-many
    workspace: one(Workspaces, {
      fields: [ProviderAccounts.workspaceId],
      references: [Workspaces.id],
    }),
    user: one(Users, {
      fields: [ProviderAccounts.userId],
      references: [Users.id],
    }),

    // many-to-one
    metaAccountForAdCreatives: many(AdCreatives, {
      relationName: "metaAccountToAdCreatives",
    }),
    stats: many(Stats),
    subAccounts: many(ProviderSubAccounts, {
      relationName: "providerAccountToSubAccounts",
    }),
    tiktokAccountForAdCreatives: many(AdCreatives, {
      relationName: "tiktokAccountToAdCreatives",
    }),

    // many-to-many
    _playlists: many(_Playlists_To_ProviderAccounts),
  }),
);
