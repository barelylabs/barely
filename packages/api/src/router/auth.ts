import { apiProtectedProcedure, apiProcedure, router } from "../trpc";

export const authRouter = router({
  getSession: apiProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: apiProtectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @acme/auth package
    return "you can see this secret message!";
  }),
});
