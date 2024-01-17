import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import * as r from "remeda";
import { z } from "zod";

import type { SpotifyTrackOption } from "./spotify.schema";
import env from "../env";
import { privateProcedure, publicProcedure, router } from "./api";
import { ProviderAccounts } from "./provider-account.sql";
import { searchSpotify } from "./spotify.endpts.search";
import {
  getSpotifyAccessToken,
  syncSpotifyAccountPlaylists,
  syncSpotifyAccountUser,
} from "./spotify.fns";

const spotifyRouter = router({
  findTrack: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    if (input.length === 0) return [];

    const botSpotifyAccount =
      await ctx.db.http.query.ProviderAccounts.findFirst({
        where: and(
          eq(ProviderAccounts.provider, "spotify"),
          eq(ProviderAccounts.providerAccountId, env.BOT_SPOTIFY_ACCOUNT_ID),
        ),
      });

    if (!botSpotifyAccount) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "We're having trouble with the Spotify API right now. Bear with us.",
        cause: "No bot Spotify account found.",
      });
    }

    const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

    if (!accessToken) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "We're having trouble with the Spotify API right now. Bear with us.",
        cause: "No Spotify access token found for bot.",
      });
    }

    const searchResults = await searchSpotify({
      accessToken,
      query: input,
      types: ["track"],
    });

    const trackResults = searchResults.tracks?.items ?? [];

    const tracks = trackResults.map((t) => {
      const track: SpotifyTrackOption = {
        id: "spotify." + t.id,
        name: t.name,
        spotifyId: t.id,
        isrc: t.external_ids.isrc,
        released: true,
        imageUrl:
          t.album.images.find(
            (image) => image.width === 300 || image.width === 640,
          )?.url ?? null,
        workspace: {
          name: t.artists[0]?.name ?? "Unknown Artist",
          spotifyArtistId: t.artists[0]?.id ?? "unknown",
        },
      };

      return track;
    });

    // console.log('tracks => ', tracks);

    const uniqueTracks = r.uniqBy(tracks, (t) => t.spotifyId);

    // console.log('uniqueTracks => ', uniqueTracks);
    return uniqueTracks;
  }),

  syncSpotifyAccount: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await syncSpotifyAccountUser(input, ctx.db);
      await syncSpotifyAccountPlaylists(input, ctx.db);
      return true;
    }),

  syncCurrentUser: privateProcedure.mutation(async ({ ctx }) => {
    const spotifyAccounts = await ctx.db.http.query.ProviderAccounts.findMany({
      where: and(
        eq(ProviderAccounts.provider, "spotify"),
        eq(ProviderAccounts.userId, ctx.user.id),
      ),
    });

    for (const spotifyAccount of spotifyAccounts) {
      if (!spotifyAccount.providerAccountId) continue;
      await syncSpotifyAccountUser(spotifyAccount.providerAccountId, ctx.db);
    }

    return true;
  }),

  syncSpotifyPlaylistsByAccountSpotifyId: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: `/spotify/sync-playlists/{accountSpotifyId}`,
      },
    })
    .input(z.object({ accountSpotifyId: z.string() }))
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      console.log(
        "syncing spotify playlists from open endpoint",
        input.accountSpotifyId,
      );
      await syncSpotifyAccountPlaylists(input.accountSpotifyId, ctx.db);
      return true;
    }),
});

export { spotifyRouter };
