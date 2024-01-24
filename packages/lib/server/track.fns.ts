import type { Db, DbPoolTransaction } from "./db";
import type { CreateTrack } from "./track.schema";
import { newId } from "../utils/id";
import { Tracks } from "./track.sql";

export async function createTrack(
  track: CreateTrack,
  db: Db,
  tx?: DbPoolTransaction,
) {
  const newTrackId = newId("track");

  const dbTrack = (
    await (tx ?? db.pool)
      .insert(Tracks)
      .values({
        ...track,
        id: newTrackId,
      })
      .returning()
  )[0];

  return dbTrack;
}
