import { router, publicProcedure, privateProcedure } from "../trpc";

export const authRouter = router({
  getUser: publicProcedure.query(({ ctx }) => {
    // console.log("ctx => ", ctx);
    return ctx.user;
  }),
  getSecretMessage: privateProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @acme/auth package
    return "you can see this secret message!";
  }),
});
