import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import env from '../../env';
import { publicProcedure, router } from '../trpc';
import { getSpotifyAccessToken } from './spotify.edge.fns';
import { searchSpotify } from './spotify.endpts.search';
import { SpotifyTrackOption } from './spotify.schema';

const spotifyRouter = router({
	findTrack: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const botSpotifyAccount = await ctx.kyselyRead
			.selectFrom('Account')
			.selectAll()
			.where('provider', '=', 'spotify')
			.where('providerAccountId', '=', env.BOT_SPOTIFY_ACCOUNT_ID)
			.executeTakeFirst();

		if (!botSpotifyAccount) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message:
					"No bot Spotify account found. We're having trouble with the Spotify API right now. Bear with us.",
				cause: 'No bot Spotify account found.',
			});
		}

		const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

		if (!accessToken) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: "We're having trouble with the Spotify API right now. Bear with us.",
				cause: 'No Spotify access token found for bot.',
			});
		}

		const searchResults = await searchSpotify({
			accessToken,
			query: input,
			types: ['track'],
		});

		const trackResults = searchResults.tracks?.items ?? [];

		const tracks = trackResults.map(t => {
			const track: SpotifyTrackOption = {
				name: t.name,
				spotifyId: t.id,
				isrc: t.external_ids.isrc,
				released: true,
				imageUrl:
					t.album.images.find(image => image.width === 300 || image.width === 640)?.url ??
					null,
				artist: {
					name: t.artists[0].name,
					spotifyArtistId: t.artists[0].id,
				},
			};
			return track;
		});

		return tracks;
	}),
});

export { spotifyRouter };
