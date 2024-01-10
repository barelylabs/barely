import { TRPCError } from "@trpc/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

import env from "../env";
import { newId } from "../utils/id";
import {
  getAppAndAppRouteFromUrl,
  getMetaTags,
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
      const link = await ctx.db.read.query.Links.findFirst({
        where: eq(Links.id, input),
      });

      return link ?? null;
    }
  }),

  byWorkspace: privateProcedure
    .input(linkFilterParamsSchema.optional())
    .query(async ({ input, ctx }) => {
      console.log("input => ", input);

      const searchCondition =
        input?.search && input.search.length > 0
          ? or(
              sqlStringContains(Links.key, input.search),
              sqlStringContains(Links.url, input.search),
            )
          : undefined;

      const links = await ctx.db.read.query.Links.findMany({
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

      const appData = getAppAndAppRouteFromUrl(input.url);

      if (!appData) {
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
        ...appData,
        ...metaTags,
      };

      console.log("createLinkValues => ", createLinkValues);
      const link = await ctx.db.write
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

      const url =
        input.url ??
        (
          await ctx.db.read.query.Links.findFirst({
            where: eq(Links.id, input.id),
          })
        )?.url ??
        raise("Link not found");

      const metaTags = input.customMetaTags
        ? {
            title: input.title,
            description: input.description,
            image: input.image,
          }
        : await getMetaTags(url);

      const link = await ctx.db.write
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
