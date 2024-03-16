import { and, eq, inArray, notInArray } from "drizzle-orm";
import { z } from "zod";

import { pushEvent } from "../utils/pusher-server";
import { sqlAnd } from "../utils/sql";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "./api/trpc";
import { _Files_To_Tracks__Artwork, _Files_To_Tracks__Audio } from "./file.sql";
import { insertGenreSchema } from "./genre.schema";
import { _Tracks_To_Genres } from "./genre.sql";
import {
  createTrack,
  getTrackById,
  getTrackBySpotifyId,
  getTracksByWorkspaceId,
} from "./track.fns";
import {
  createTrackSchema,
  trackFilterParamsSchema,
  updateTrackSchema,
} from "./track.schema";
import { Tracks } from "./track.sql";

export const trackRouter = createTRPCRouter({
  byId: privateProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getTrackById(input, ctx.db);
  }),

  byWorkspace: privateProcedure
    .input(trackFilterParamsSchema.omit({ selectedTrackIds: true }).optional())
    .query(async ({ ctx }) => {
      return await getTracksByWorkspaceId(ctx.workspace.id, ctx.db);
    }),

  bySpotifyId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await getTrackBySpotifyId(input, ctx.db);
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

  // create
  create: privateProcedure
    .input(createTrackSchema)
    .mutation(async ({ ctx, input }) => {
      return await createTrack(input, ctx.workspace.id, ctx.db);
      // const { _genres, _artworkFiles, _audioFiles, ...data } = input;

      // const newTrack: InsertTrack = {
      //   ...data,
      //   id: newId("track"),
      //   workspaceId: ctx.workspace.id,
      // };

      // await ctx.db.pool.insert(Tracks).values(newTrack);

      // if (_genres?.length) {
      //   await ctx.db.pool.insert(_Tracks_To_Genres).values(
      //     _genres.map((genreId) => ({
      //       genreId,
      //       trackId: newTrack.id,
      //     })),
      //   );
      // }

      // if (_artworkFiles?.length) {
      //   console.log("creating artwork join", _artworkFiles);
      //   await ctx.db.pool.insert(_Files_To_Tracks__Artwork).values(
      //     _artworkFiles.map((_artworkFile) => ({
      //       ..._artworkFile,
      //       trackId: newTrack.id,
      //     })),
      //   );
      // }

      // console.log("_audioFiles", _audioFiles);

      // if (_audioFiles?.length) {
      //   console.log("creating audio joins", _audioFiles);
      //   await ctx.db.pool.insert(_Files_To_Tracks__Audio).values(
      //     _audioFiles.map((_audioFile) => ({
      //       ..._audioFile,
      //       trackId: newTrack.id,
      //     })),
      //   );
      // }

      // return await getTrackById(newTrack.id, ctx.db);
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
        socketId: ctx.pusherSocketId,
      });
    }),

  update: privateProcedure
    .input(updateTrackSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { _genres, _artworkFiles, _audioFiles, ...data } = updateData;

      await ctx.db.http
        .update(Tracks)
        .set(data)
        .where(
          and(eq(Tracks.id, id), eq(Tracks.workspaceId, ctx.workspace.id)),
        );

      if (_genres?.length) {
        await ctx.db.http
          .delete(_Tracks_To_Genres)
          .where(
            and(
              eq(_Tracks_To_Genres.trackId, id),
              notInArray(_Tracks_To_Genres.genreId, _genres),
            ),
          );

        await ctx.db.http.insert(_Tracks_To_Genres).values(
          _genres.map((genreId) => ({
            trackId: id,
            genreId,
          })),
        );
      }

      if (_artworkFiles?.length) {
        // if one of the artworkFiles is marked as current, set all others to not current
        const currentArtworkFile = _artworkFiles.find((f) => f.current);
        if (currentArtworkFile) {
          await ctx.db.http
            .update(_Files_To_Tracks__Artwork)
            .set({ current: null })
            .where(eq(_Files_To_Tracks__Artwork.trackId, id));
        }

        await ctx.db.http.insert(_Files_To_Tracks__Artwork).values(
          _artworkFiles.map((_artworkFile) => ({
            ..._artworkFile,
            trackId: id,
          })),
        );
      }

      if (_audioFiles?.length) {
        // if one of the audioFiles is marked as masterCompressed, set all others to not masterCompressed
        const masterCompressedAudioFile = _audioFiles.find(
          (f) => f.masterCompressed,
        );
        if (masterCompressedAudioFile) {
          await ctx.db.pool
            .update(_Files_To_Tracks__Audio)
            .set({ masterCompressed: null })
            .where(eq(_Files_To_Tracks__Audio.trackId, id));
        }

        // if one of the audioFiles is marked as masterWav, set all others to not masterWav
        const masterWavAudioFile = _audioFiles.find((f) => f.masterWav);
        if (masterWavAudioFile) {
          await ctx.db.pool
            .update(_Files_To_Tracks__Audio)
            .set({ masterWav: null })
            .where(eq(_Files_To_Tracks__Audio.trackId, id));
        }

        await ctx.db.pool.insert(_Files_To_Tracks__Audio).values(
          _audioFiles.map((_audioFile) => ({
            ..._audioFile,
            trackId: id,
          })),
        );
      }
    }),

  // delete
  archive: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.http
        .update(Tracks)
        .set({ archived: true })
        .where(
          and(
            eq(Tracks.workspaceId, ctx.workspace.id),
            inArray(Tracks.id, input),
          ),
        );
    }),

  delete: privateProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.http
        .update(Tracks)
        .set({
          deletedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(Tracks.workspaceId, ctx.workspace.id),
            inArray(Tracks.id, input),
          ),
        );
    }),
});
