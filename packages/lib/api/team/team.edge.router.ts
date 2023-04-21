import { z } from 'zod';

import { publicProcedure, router } from '../trpc';

// export const teamRouter = router({
//   bySpotifyId: publicProcedure
//     .input(z.object({ spotifyId: z.string() }))
//     .query(async ({ ctx, input }) => {
//       const artistTeam = await ctx.kyselyRead.selectFrom('Team')
//         .where('spotifyArtistId', '=', input.spotifyId)
//         .selectAll()
//         .executeTakeFirst();

//       if (!artistTeam) return null;

//       if (!ctx.user?.id)
//         throw new TRPCError({
//           code: 'UNAUTHORIZED',
//           message: `You must be logged in as a member of ${artistTeam.name}'s team to create a new campaign for them.`,
//         });

//   })
