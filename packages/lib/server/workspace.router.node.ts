import { eq } from "drizzle-orm";
import { z } from "zod";

import { privateProcedure, router } from "./api";
import { cloudinary } from "./cloudinary.fns";
import { Workspaces } from "./workspace.sql";

export const workspaceNodeRouter = router({
  uploadAvatar: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { secure_url } = await cloudinary.upload(input, {
        public_id: ctx.workspace.id,
        folder: "avatars",
        overwrite: true,
        invalidate: true,
      });

      await ctx.db.write
        .update(Workspaces)
        .set({ imageUrl: secure_url })
        .where(eq(Workspaces.id, ctx.workspace.id));

      return secure_url;
    }),
});
