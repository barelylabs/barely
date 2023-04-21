import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { privateProcedure, publicProcedure, router } from '../trpc';
import { TrackWithArtistAndGenres } from './track.schema';

const trackRouter = router({
	byId: privateProcedure
		.input(
			z.object({
				id: z.string(),
				// includeArtist: z.boolean().optional(),
				// includeGenres: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const track = await ctx.kyselyRead
				.selectFrom('Track')
				.where('id', '=', input.id)
				.selectAll()
				.executeTakeFirst();

			if (!track) throw new TRPCError({ code: 'NOT_FOUND', message: 'Track not found' });

			const artist = await ctx.kyselyRead
				.selectFrom('Team')
				.where('id', '=', track.teamId)
				.selectAll()
				.executeTakeFirst();

			if (!artist)
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Artist not found' });

			const trackGenres = await ctx.kyselyRead
				.selectFrom('TrackGenre')
				.where('trackId', '=', input.id)
				.selectAll()
				.execute();

			const genres = trackGenres.map(tg => tg.genreName);

			const trackWithArtistAndGenres: TrackWithArtistAndGenres = {
				...track,
				artist,
				genres,
			};

			return trackWithArtistAndGenres;
		}),

	existsBySpotifyId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const track = await ctx.kyselyRead
			.selectFrom('Track')
			.where('spotifyId', '=', input)
			.select('id')
			.executeTakeFirst();

		return !!track;
	}),
});

export { trackRouter };
