import { newId } from "../utils/id";
import { publicProcedure, router } from "./api";
import { createVisitorSessionSchema } from "./visitor-session.schema";
import { VisitorSessions } from "./visitor-session.sql";

export const visitorSessionRouter = router({
  create: publicProcedure
    .input(createVisitorSessionSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.write
        .insert(VisitorSessions)
        .values({ ...input, id: newId("webSession") })
        .execute();
    }),
});
