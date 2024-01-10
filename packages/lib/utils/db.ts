import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

import type { Db } from "../server/db";
import { db } from "../server/db";

export function dbRead(db: Db) {
  return db.closestRead ?? db.read;
}

export function dbReadPool(db: Db) {
  return db.closestReadPool ?? db.readPool;
}

export function dbWithClosestDbRead(headers: ReadonlyHeaders) {
  const latitude =
    headers.get("x-latitude") ?? headers.get("x-vercel-ip-latitude");
  const longitude =
    headers.get("x-longitude") ?? headers.get("x-vercel-ip-longitude");

  // fixme: actually implement closestDbRead once we have multiple read replicas
  const closestDbRead = latitude && longitude ? db.read : db.read;
  const closestDbReadPool = latitude && longitude ? db.readPool : db.readPool;

  return {
    ...db,
    dbRead: closestDbRead,
    dbReadPool: closestDbReadPool,
  };
}
