import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

import type { GenreId } from "./genre.schema";
import { cuid } from "../utils/sql";
import { Playlists } from "./playlist.sql";
import { Tracks } from "./track.sql";

// export const genreIdEnum = pgEnum('id', genreIds);

export const Genres = pgTable("Genres", {
  id: varchar("id", { length: 255 }).$type<GenreId>().notNull().primaryKey(),
  parent: varchar("parent", { length: 255 }).notNull(),
  subgenre: varchar("subgenre", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

export const Genre_Relations = relations(Genres, ({ many }) => ({
  // many-to-many
  _playlists: many(_Playlists_To_Genres),
  _tracks: many(_Tracks_To_Genres),
}));

// join tables

// playlists genres
export const _Playlists_To_Genres = pgTable(
  "_Playlists_To_Genres",
  {
    playlistId: cuid("playlistId")
      .notNull()
      .references(() => Playlists.id, { onDelete: "cascade" }),
    genreId: varchar("genreId", { length: 255 })
      .$type<GenreId>()
      .notNull()
      .references(() => Genres.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      primary: primaryKey(table.playlistId, table.genreId),
      genre: index("_PlaylistsToGenres_genre_idx").on(table.genreId),
    };
  },
);

export const _Playlists_To_Genres_Relations = relations(
  _Playlists_To_Genres,
  ({ one }) => ({
    // one-to-many
    playlist: one(Playlists, {
      fields: [_Playlists_To_Genres.playlistId],
      references: [Playlists.id],
    }),
    genre: one(Genres, {
      fields: [_Playlists_To_Genres.genreId],
      references: [Genres.id],
    }),
  }),
);

// track genres

export const _Tracks_To_Genres = pgTable(
  "_Tracks_To_Genres",
  {
    trackId: cuid("trackId")
      .notNull()
      .references(() => Tracks.id, { onDelete: "cascade" }),
    genreId: varchar("genreId", { length: 255 })
      .$type<GenreId>()
      .notNull()
      .references(() => Genres.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      primary: primaryKey(table.trackId, table.genreId),
      genre: index("_TracksToGenres_genre_idx").on(table.genreId),
    };
  },
);

export const _Tracks_To_Genres_Relations = relations(
  _Tracks_To_Genres,
  ({ one }) => ({
    // one-to-many
    track: one(Tracks, {
      fields: [_Tracks_To_Genres.trackId],
      references: [Tracks.id],
    }),
    genre: one(Genres, {
      fields: [_Tracks_To_Genres.genreId],
      references: [Genres.id],
    }),
  }),
);
