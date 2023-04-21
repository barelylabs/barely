import { z } from 'zod';

import { prisma } from '@barely/db';

import { privateProcedure, publicProcedure, router } from '../trpc';
import { teamSchema } from './team.schema';

export const teamRouter = router({
	create: privateProcedure
		.input(teamSchema.partial({ id: true }))
		.mutation(async ({ ctx, input }) => {
			const newTeam = await prisma.team.create({
				data: {
					...input,
					members: {
						create: {
							role: 'owner',
							user: {
								connect: {
									id: ctx.user.id,
								},
							},
						},
					},
				},
			});
			return newTeam;
		}),

	bySpotifyId: publicProcedure
		.input(z.object({ spotifyId: z.string() }))
		.query(async ({ input }) => {
			const artistTeam = await prisma.team.findUnique({
				where: {
					spotifyArtistId: input.spotifyId,
				},
				include: {
					// include members where role is owner or admin
					members: { where: { role: { in: ['owner', 'admin'] } } },
					// members: { where: { role: } } },
				},
			});

			console.log('artistTeam => ', artistTeam);

			if (!artistTeam) return null;

			// if (!ctx.user?.id)
			// 	throw new TRPCError({
			// 		code: 'UNAUTHORIZED',
			// 		message: `You must be logged in as a member of ${artistTeam.name}'s team to create a new campaign for them.`,
			// 	});

			// const userIsAdmin = artistTeam.members.some(
			// 	member => member.userId === ctx.user?.id,
			// );

			// if (!userIsAdmin)
			// 	throw new TRPCError({
			// 		code: 'UNAUTHORIZED',
			// 		message: `You must have admin access to ${artistTeam.name}'s team to create a new campaign for them. Contact someone on the team to get access.`,
			// 	});

			return artistTeam;
		}),
});
