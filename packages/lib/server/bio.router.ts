import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "./api";

export const bioRouter = router({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: bioId, ctx }) => {
      return await ctx.db.http.query.Bios.findFirst({
        where: (Bios) => eq(Bios.id, bioId),
      });
    }),
});
