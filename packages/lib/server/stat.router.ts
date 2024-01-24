import { publicProcedure, router } from "./api";
import {
  pipe_webHitsTimeseries,
  pipe_webSourcesTopBrowsers,
  pipe_webSourcesTopCities,
  pipe_webSourcesTopCountries,
  pipe_webSourcesTopDevices,
  pipe_webSourcesTopOs,
  pipe_webSourcesTopReferers,
  stdWebEventPipeParamsSchema,
  stdWebEventQueryToPipeParamsSchema,
} from "./stat.schema";

export const statRouter = router({
  linkTimeseries: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("an assetId is required");
      }

      const timeseries = await pipe_webHitsTimeseries({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      console.log("timeseries => ", timeseries);
      return timeseries.data.map((row) => ({
        ...row,
        clicks: row.pageviews,
      }));
    }),

  topBrowsers: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const topBrowsers = await pipe_webSourcesTopBrowsers({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      return topBrowsers.data;
    }),

  topDevices: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const topDevices = await pipe_webSourcesTopDevices({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      return topDevices.data;
    }),

  topOperatingSystems: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const topOperatingSystems = await pipe_webSourcesTopOs({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      return topOperatingSystems.data;
    }),

  topCities: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      console.log("cities workspaceId : ", ctx.workspace?.id);
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const topCities = await pipe_webSourcesTopCities({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      return topCities.data;
    }),

  topCountries: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const props = stdWebEventPipeParamsSchema.parse({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      console.log("props : ", props);
      const topCountries = await pipe_webSourcesTopCountries({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      console.log("topCountries => ", topCountries);

      return topCountries.data;
    }),

  topReferers: publicProcedure
    .input(stdWebEventQueryToPipeParamsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.workspace && !input.assetId) {
        throw new Error("assetId is required");
      }

      const topReferers = await pipe_webSourcesTopReferers({
        ...input,
        workspaceId: ctx.workspace?.id,
      });

      return topReferers.data;
    }),
});
