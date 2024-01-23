import { z } from "zod";

import { privateProcedure, publicProcedure, router } from "../api";
import { sendLoginEmail } from "./auth.fns";

export const authRouter = router({
  sendLoginEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        callbackUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const emailRes = await sendLoginEmail(input);

      if (!emailRes) return { success: false, message: "Something went wrong" };

      return { success: true };
    }),

  privateMessage: privateProcedure.query(({ ctx }) => {
    return {
      message: `Hello ${ctx.user?.email ?? ctx.user?.firstName ?? "user"}`,
    };
  }),

  // logOut: publicProcedure.mutation(async ({ ctx }) => {
  // 	await signOut();
  // 	return { success: true };
  // }),
});
