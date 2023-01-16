import { router, publicProcedure, privateProcedure } from "../trpc";

import { z } from "zod";

export const bioRouter = router({
  getById: publicProcedure
    .input(z.object({ bioId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.bio.findUnique({
        where: {
          id: input.bioId,
        },
      });
    }),

  // getArtistRemarketing: procedure
  //   .input(z.object({ bioId: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const bio = await ctx.prisma.bio.findUnique({
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
