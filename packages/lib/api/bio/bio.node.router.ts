import { z } from 'zod';

import { prisma } from '@barely/db';

import { publicProcedure, router } from '../trpc';

export const bioRouter = router({
	getById: publicProcedure
		.input(z.object({ bioId: z.string() }))
		.query(async ({ input }) => {
			return await prisma.bio.findUnique({
				where: {
					id: input.bioId,
				},
			});
		}),

	// getArtistRemarketing: procedure
	//   .input(z.object({ bioId: z.string() }))
	//   .query(async ({ ctx, input }) => {
	//     const bio = await prisma.bio.findUnique({
	//       where: {
	//         id: input.bioId,
	//       },
	//       select: {
	//         artist: {
	//           select: {
	//             remarketing: true,
	//           },
	//         },
	//       },
	//     });
	//     return bio?.artist.remarketing;
	//   }),
});
