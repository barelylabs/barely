import { router, procedure } from "../trpc";
import { z } from "zod";

export const postRouter = router({
  all: procedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
  byId: procedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.post.findFirst({ where: { id: input } });
  }),
  create: procedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({ data: input });
    }),
});
