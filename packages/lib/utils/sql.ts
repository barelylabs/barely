import type { SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { and, sql } from "drizzle-orm";
import { timestamp, varchar } from "drizzle-orm/pg-core";

import { raise } from "./raise";

export const cuid = (name: string) => varchar(name, { length: 255 });

export const primaryId = {
  get id() {
    return cuid("id").primaryKey().notNull();
  },
};

export const id = {
  get id() {
    return cuid("id").notNull().unique();
  },
};

export const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "string",
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    mode: "string",
  })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp("deleted_at", {
    mode: "string",
  }),
};

// queries

export const sqlCount = sql<number>`count(*)`.mapWith(Number);
export const sqlCurrentDateTime = sql<string>`CURRENT_TIMESTAMP`;
export const sqlCurrentTimestamp = sql<string>`CURRENT_TIMESTAMP`;

export const sqlStringContains = (column: PgColumn, value: string) =>
  sql`LOWER(${column}) LIKE LOWER('%' || ${value} || '%')`;

export const sqlStringEndsWith = (column: PgColumn, value: string) =>
  sql`LOWER(${column}) LIKE LOWER('%' || ${value})`;

export function sqlAnd(conditions: (SQL | false | undefined | null)[]) {
  const filteredConditions = conditions.filter(
    (c) => c !== undefined && c !== false,
  ) as SQL[];
  const _and =
    filteredConditions.length > 0 ? and(...filteredConditions) : undefined;

  if (_and === undefined) {
    return raise("sqlAnd: no conditions provided");
  }

  return _and;
}

export function sqlIncrement(column: PgColumn, value = 1) {
  return sql`${column} + ${value}`;
}
