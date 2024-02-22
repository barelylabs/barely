import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import type { DomainStatus } from "./domain.schema";
import { env } from "../env";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "./api/trpc";
import {
  getDomainConfigFromVercel,
  getDomainResponseFromVercel,
  getDomainsAvailable,
  verifyDomainOnVercel,
} from "./domain.fns";
import { Domains } from "./domain.sql";

export const domainRouter = createTRPCRouter({
  byDomain: privateProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const domain = await ctx.db.http.query.Domains.findFirst({
      where: and(
        eq(Domains.workspaceId, ctx.workspace.id),
        eq(Domains.domain, input),
      ),
    });

    return domain;
  }),

  byWorkspace: privateProcedure.query(async ({ ctx }) => {
    const domains = await ctx.db.pool.query.Domains.findMany({
      where: eq(Domains.workspaceId, ctx.workspace.id),
      orderBy: (domains, { desc }) => [desc(domains.isPrimaryLinkDomain)],
    });

    return domains;
  }),

  verifyOnVercel: privateProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      let status: DomainStatus = "Valid Configuration";

      const domain = await ctx.db.http.query.Domains.findFirst({
        where: and(
          eq(Domains.workspaceId, ctx.workspace.id),
          eq(Domains.domain, input),
        ),
      });

      if (!domain) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Domain ${input} not found`,
        });
      }

      const vercelDomainResponse = await getDomainResponseFromVercel({
        domain: input,
        type: domain.type,
      });

      const vercelConfigResponse = await getDomainConfigFromVercel(input);

      /**
       * Domain not found on Vercel project
       */

      if (
        !vercelDomainResponse.success &&
        vercelDomainResponse.parsed &&
        vercelDomainResponse.data.error.code === "not_found"
      ) {
        // domain not found on Vercel project
        status = "Domain Not Found";
        console.log(
          "domain not found on vercel project => ",
          vercelDomainResponse.data,
        );
        return {
          status,
          vercelDomainResponse: vercelDomainResponse,
          vercelConfigResponse: vercelConfigResponse,
        };
      }

      /**
       * Unknown error
       */

      if (!vercelDomainResponse.success && vercelDomainResponse.parsed) {
        status = "Unknown Error";
        return {
          status,
          vercelDomainResponse: vercelDomainResponse,
          vercelConfigResponse: vercelConfigResponse,
        };
      }

      /**
       * Domain has DNS conflicts
       */
      if (
        vercelConfigResponse.success &&
        vercelConfigResponse.parsed &&
        vercelConfigResponse.data.conflicts?.length > 0
      ) {
        status = "Conflicting DNS Records";
        return {
          status,
          vercelDomainResponse: vercelDomainResponse,
          vercelConfigResponse: vercelConfigResponse,
        };
      }

      /**
       * If domain is not verified, we try to verify now
       */
      if (
        vercelDomainResponse.success &&
        vercelDomainResponse.parsed &&
        !vercelDomainResponse.data.verified
      ) {
        status = "Pending Verification";
        const verifyResponse = await verifyDomainOnVercel({
          domain: input,
          // projectId: domain.type === 'link' ? env.VERCEL_LINK_PROJECT_ID : '', //fixme - add env var for bio and press
          type: domain.type,
        });

        console.log("verify response => ", verifyResponse.data);

        if (
          verifyResponse.success &&
          verifyResponse.parsed &&
          verifyResponse.data.verified
        ) {
          /* Domain was just verified */
          status = "Valid Configuration";
          await ctx.db.pool
            .update(Domains)
            .set({ verified: true })
            .where(
              and(
                eq(Domains.workspaceId, ctx.workspace.id),
                eq(Domains.domain, input),
              ),
            );
        }

        return {
          status,
          vercelDomainResponse: vercelDomainResponse,
          vercelConfigResponse: vercelConfigResponse,
          verifyResponse: verifyResponse,
        };
      }

      /**
       * The domain is verified and has no DNS conflicts
       * Now we just check if the domain has the correct configuration
       * */
      if (vercelConfigResponse.success && vercelConfigResponse.parsed) {
        const { data } = vercelConfigResponse;

        if (!data.misconfigured) {
          await ctx.db.pool
            .update(Domains)
            .set({ verified: true, lastCheckedAt: new Date() })
            .where(
              and(
                eq(Domains.workspaceId, ctx.workspace.id),
                eq(Domains.domain, input),
              ),
            );
        } else {
          status = "Invalid Configuration";
          await ctx.db.pool
            .update(Domains)
            .set({ verified: false, lastCheckedAt: new Date() })
            .where(
              and(
                eq(Domains.workspaceId, ctx.workspace.id),
                eq(Domains.domain, input),
              ),
            );
        }
      }

      return {
        status,
        vercelDomainResponse: vercelDomainResponse,
        vercelConfigResponse: vercelConfigResponse,
      };
    }),

  getAvailableToPurchase: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const availability = await getDomainsAvailable([input]);

      return {
        domain: input,
        available: availability.availableDomains.length > 0,
        price: availability.availableDomains[0]?.price,
        duration: availability.availableDomains[0]?.duration,
      };
    }),

  getSuggestedLinkDomainsToPurchase: publicProcedure
    .input(z.string().optional())
    .query(async ({ input, ctx }) => {
      const handle = input ?? ctx.workspace?.handle;

      if (!handle) {
        return [];
      }

      const domainsToCheck =
        env.VERCEL_ENV === "production"
          ? [
              `${handle}.link`,
              `${handle}.to`,
              `${handle}.co`,
              `${handle}.rocks`,
              `${handle}.tv`,
              `${handle}.info`,
              `${handle}.io`,
            ]
          : [`${handle}.com`, `${handle}.net`, `${handle}.org`, `${handle}.fr`];

      const domains = await getDomainsAvailable(domainsToCheck);

      // console.log('checkedDomains => ', domains);

      const orderedDomains = domains.availableDomains.sort(
        (a, b) =>
          domainsToCheck.indexOf(a.domain) - domainsToCheck.indexOf(b.domain),
      );

      return orderedDomains;
    }),
});
