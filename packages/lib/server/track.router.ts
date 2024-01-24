import { and, eq, notInArray } from "drizzle-orm";
import { z } from "zod";

import type { TrackWithWorkspaceAndGenres } from "./track.schema";
import { pushEvent } from "../utils/pusher-server";
import { sqlAnd } from "../utils/sql";
import { privateProcedure, publicProcedure, router } from "./api";
import { insertGenreSchema } from "./genre.schema";
import { _Tracks_To_Genres } from "./genre.sql";
import { updateTrackSchema } from "./track.schema";
import { Tracks } from "./track.sql";

const trackRouter = router({
  byId: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const track = await ctx.db.http.query.Tracks.findFirst({
      where: eq(Tracks.id, input),
      with: {
        workspace: true,
        _genres: {
          with: {
            genre: true,
          },
        },
      },
    });

    if (!track) return null;

    const trackWithWorkspaceAndGenres: TrackWithWorkspaceAndGenres = {
      ...track,
      genres: track._genres.map((_g) => _g.genre),
    };

    return trackWithWorkspaceAndGenres;
  }),

  bySpotifyId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.http.query.Tracks.findFirst({
        where: eq(Tracks.spotifyId, input),
        with: {
          workspace: true,
          _genres: {
            with: {
              genre: true,
            },
          },
        },
      });

      if (!track) return null;

      const trackWithArtistAndGenres: TrackWithWorkspaceAndGenres = {
        ...track,
        genres: track._genres.map((_g) => _g.genre),
      };

      return trackWithArtistAndGenres;
    }),

  existsBySpotifyId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const track = await ctx.db.http.query.Tracks.findFirst({
        where: eq(Tracks.spotifyId, input),
        columns: {
          id: true,
        },
      });

      return !!track;
    }),

  // update
  updateGenres: privateProcedure
    .input(
      z.object({ trackId: z.string(), genres: z.array(insertGenreSchema) }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.pool.transaction(async (tx) => {
        await tx.delete(_Tracks_To_Genres).where(
          sqlAnd([
            eq(_Tracks_To_Genres.trackId, input.trackId),
            input.genres.length > 0 &&
              notInArray(
                _Tracks_To_Genres.genreId,
                input.genres.map((g) => g.id),
              ),
          ]),
        );

        await Promise.allSettled(
          input.genres.map((g) => {
            return tx
              .insert(_Tracks_To_Genres)
              .values({
                trackId: input.trackId,
                genreId: g.id,
              })
              .onConflictDoNothing({
                target: [_Tracks_To_Genres.trackId, _Tracks_To_Genres.genreId],
              });
          }),
        );
      });

      await pushEvent("track", "update", {
        id: input.trackId,
        pageSessionId: ctx.pageSessionId,
      });
    }),

  update: privateProcedure
    .input(updateTrackSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { genreIds, ...data } = updateData;

      await ctx.db.http.update(Tracks).set(data).where(eq(Tracks.id, id));

      if (genreIds) {
        await ctx.db.http
          .delete(_Tracks_To_Genres)
          .where(
            and(
              eq(_Tracks_To_Genres.trackId, id),
              notInArray(_Tracks_To_Genres.genreId, genreIds),
            ),
          );

        await ctx.db.http.insert(_Tracks_To_Genres).values(
          genreIds.map((genreId) => ({
            trackId: id,
            genreId,
          })),
        );
      }
    }),
});

export { trackRouter };
