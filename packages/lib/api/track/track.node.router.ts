import { z } from 'zod';

import { prisma } from '@barely/db';

import { pusher } from '../pusher';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { trackUpdateSchema } from './track.schema';

const trackRouter = router({
	all: publicProcedure.query(async ({ ctx }) => {
		console.log('ctx => ', ctx);
		return await prisma.track.findMany({ take: 10 });
	}),

	byId: privateProcedure.input(z.string()).query(async ({ input }) => {
		const track = await prisma.track.findFirst({
			where: { id: input },
			include: {
				team: true,
				trackGenres: {
					select: {
						genre: {
							select: {
								_count: { select: { playlistGenres: true } },
								name: true,
							},
						},
					},
				},
			},
		});

		return track;
	}),

	bySpotifyId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const track = await prisma.track.findFirst({ where: { spotifyId: input } });
		return track;
	}),

	update: privateProcedure.input(trackUpdateSchema).mutation(async ({ ctx, input }) => {
		const { id, ...updateData } = input;

		const { genreNames, ...data } = updateData;

		console.log('trackId => ', id);
		console.log('genreNames => ', genreNames);

		const track = await prisma.track.update({
			where: {
				id,
				// todo - add owner/manager check
			},
			data,
			select: {
				campaigns: {
					select: {
						id: true,
					},
				},
			},
		});

		if (genreNames) {
			await Promise.allSettled(
				genreNames.map(async genreName => {
					await prisma.trackGenre.upsert({
						where: { trackId_genreName: { trackId: id, genreName } },
						update: {},
						create: {
							track: { connect: { id } },
							genre: {
								connectOrCreate: {
									where: { name: genreName },
									create: { name: genreName },
								},
							},
						},
					});
				}),
			);

			await prisma.trackGenre.deleteMany({
				where: {
					trackId: id,
					genreName: {
						notIn: genreNames,
					},
				},
			});
		}
		await pusher.trigger(`tracks`, `updated-${id}`, {
			pageSessionId: ctx.pageSessionId,
		});

		return track;
	}),
});

export { trackRouter };
