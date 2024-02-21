import { TRPCError } from "@trpc/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

import { env } from "../env";
import { newId } from "../utils/id";
import {
  getMetaTags,
  getTransparentLinkDataFromUrl,
  isValidUrl,
} from "../utils/link";
import { raise } from "../utils/raise";
import { sqlAnd, sqlStringContains } from "../utils/sql";
import { privateProcedure, publicProcedure, router } from "./api";
import { getRandomKey } from "./link.fns";
import {
  createLinkSchema,
  linkFilterParamsSchema,
  updateLinkSchema,
} from "./link.schema";
import { Links } from "./link.sql";

export const linkRouter = router({
  byId: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    {
      const link = await ctx.db.http.query.Links.findFirst({
        where: eq(Links.id, input),
      });

      return link ?? null;
    }
  }),

  byWorkspace: privateProcedure
    .input(linkFilterParamsSchema.optional())
    .query(async ({ input, ctx }) => {
      const searchCondition =
        input?.search && input.search.length > 0
          ? or(
              sqlStringContains(Links.key, input.search),
              sqlStringContains(Links.url, input.search),
            )
          : undefined;

      const links = await ctx.db.http.query.Links.findMany({
        where: sqlAnd([
          eq(Links.workspaceId, ctx.workspace.id),
          !!input?.userId && eq(Links.userId, input.userId),
          !input?.showArchived && eq(Links.archived, false),
          searchCondition,
        ]),
      });

      return links;
    }),

  // mutate
  create: privateProcedure
    .input(createLinkSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.workspaceId !== ctx.workspace.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid workspace`,
        });
      }

      const transparentLinkData = getTransparentLinkDataFromUrl(
        input.url,
        ctx.workspace,
      );

      if (!transparentLinkData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid URL`,
        });
      }

      const metaTags = input.customMetaTags
        ? {
            title: input.title,
            description: input.description,
            image: input.image,
          }
        : await getMetaTags(input.url);

      const linkId = newId("link");

      if (metaTags.description && metaTags.description.length > 500) {
        metaTags.description = metaTags.description.substring(0, 500);
      }

      const createLinkValues = {
        id: linkId,
        ...input,
        ...metaTags,
        ...(input.transparent ? transparentLinkData : {}),
      };

      const link = await ctx.db.http
        .insert(Links)
        .values(createLinkValues)
        .returning();
      return link;
    }),

  update: privateProcedure
    .input(updateLinkSchema)
    .mutation(async ({ input, ctx }) => {
      if (!!input.workspaceId && input.workspaceId !== ctx.workspace.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid workspace`,
        });
      }

      const existingLink =
        (await ctx.db.pool.query.Links.findFirst({
          where: eq(Links.id, input.id),
        })) ?? raise("Link not found");

      if (existingLink.transparent === true && input.transparent === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You can't make a transparent link non-transparent`,
        });
      }

      if (input.transparent === true) {
        const appData = getTransparentLinkDataFromUrl(
          existingLink.url,
          ctx.workspace,
        );

        if (!appData) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid URL`,
          });
        }

        input = { ...input, app: appData.app, appRoute: appData.appRoute };
      }

      const metaTags = input.customMetaTags
        ? {
            title: input.title,
            description: input.description,
            image: input.image,
          }
        : await getMetaTags(existingLink.url);

      console.log("metaTags", metaTags);

      const link = await ctx.db.pool
        .update(Links)
        .set({ ...input, ...metaTags })
        .where(eq(Links.id, input.id))
        .returning();
      return link;
    }),

  // utils
  getMetaTags: publicProcedure
    .input(z.string())
    .query(async ({ input: url, ctx }) => {
      if (!url?.length || !isValidUrl(url)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid URL`,
        });
      }

      // Rate limit if user is not logged in
      if (!ctx.user) {
        const ip = ctx.ip ?? env.LOCALHOST_IP;
        const { success } = await ctx.ratelimit().limit(ip);
        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Pls don't DDOS me 🙏`,
          });
        }
      }

      return await getMetaTags(url);
    }),

  generateRandomKey: publicProcedure
    .input(z.object({ domain: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await getRandomKey(input.domain, ctx.db);
    }),
});
