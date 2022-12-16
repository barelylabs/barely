import { router, procedure } from "../trpc";
import { visitorSessionCreateSchema } from "@barely/zod/db";
import { visitorSessionBaseSchema } from "@barely/zod/db/visitorsession";

export const visitorSessionRouter = router({
  create: procedure
    .meta({ openapi: { method: "POST", path: "/visitor-session/create" } })
    .input(visitorSessionCreateSchema)
    .output(visitorSessionBaseSchema)
    .mutation(async ({ ctx, input }) => {
      const visitorSession = await ctx.prisma.visitorSession.create({
        data: input,
      });
      return visitorSession;
    }),
});
