import { sendEmail } from "@barely/email";
import { SignInEmailTemplate } from "@barely/email/src/templates/sign-in";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { privateProcedure, publicProcedure, router } from "../api";
import { Users } from "../user.sql";
import { createLoginLink } from "./auth.fns";

export const authRouter = router({
  envVars: publicProcedure.query(() => {
    return {
      vercelUrl: process.env.VERCEL_URL,
      databaseUrl: process.env.DATABASE_WRITE_URL,
      vercelEnv: process.env.VERCEL_ENV,
    };
  }),
  sendLoginEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        callbackUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log("sendLoginEmail", input.email, input.callbackUrl);

      const dbUser = await ctx.db.http.query.Users.findFirst({
        where: eq(Users.email, input.email),
        with: {
          personalWorkspace: {
            columns: {
              handle: true,
            },
          },
        },
      });

      console.log("dbUser", dbUser);

      if (!dbUser)
        return {
          success: false,
          message: "Email not found",
          code: "EMAIL_NOT_FOUND",
        };

      const loginLink = await createLoginLink({
        provider: "email",
        identifier: input.email,
        callbackPath: input.callbackUrl,
      });

      const SignInEmail = SignInEmailTemplate({
        firstName: dbUser.firstName ?? dbUser.handle ?? undefined,
        loginLink,
      });

      const emailRes = await sendEmail({
        from: "barely.io <support@barely.io>",
        to: input.email,
        subject: "Barely Login Link",
        type: "transactional",
        react: SignInEmail,
      });

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
