import { router, publicProcedure, privateProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@barely/db";

export const postRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return prisma.post.findMany();
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return prisma.post.findFirst({ where: { id: input } });
  }),
  create: publicProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.post.create({ data: input });
    }),
});
