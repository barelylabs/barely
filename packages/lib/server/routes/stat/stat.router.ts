import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import type { FmPage } from '../fm/fm.schema';
import type { Link } from '../link/link.schema';
import { createTRPCRouter, workspaceQueryProcedure } from '../../api/trpc';
import { FmPages } from '../fm/fm.sql';
import { Links } from '../link/link.sql';
import {
	pipe_fmTimeseries,
	pipe_topBrowsers,
	pipe_topCities,
	pipe_topCountries,
	pipe_topDevices,
	pipe_topOs,
	pipe_topReferers,
	pipe_topRegions,
	pipe_webHitsTimeseries,
	stdWebEventQueryToPipeParamsSchema,
} from './stat.schema';

type AssetByIdResult =
	| {
			type: 'fm';
			fmPage: FmPage;
	  }
	| {
			type: 'link';
			link: Link;
	  }
	| null;

export const statRouter = createTRPCRouter({
	assetById: workspaceQueryProcedure
		.input(z.object({ assetId: z.string().optional() }))
		.query(async ({ ctx, input }): Promise<AssetByIdResult> => {
			const { assetId } = input;

			if (!assetId) return null;

			if (assetId.startsWith('fm_')) {
				const fmPage = await ctx.db.http.query.FmPages.findFirst({
					where: and(eq(FmPages.id, assetId), eq(FmPages.workspaceId, ctx.workspace.id)),
				});

				if (!fmPage) return null;

				return {
					type: 'fm',
					fmPage,
				} as const;
			}

			if (assetId.startsWith('link_')) {
				const link = await ctx.db.http.query.Links.findFirst({
					where: and(eq(Links.id, assetId), eq(Links.workspaceId, ctx.workspace.id)),
				});

				if (!link) return null;

				return {
					type: 'link',
					link,
				} as const;
			}

			return null;
		}),

	linkTimeseries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ input, ctx }) => {
			const timeseries = await pipe_webHitsTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				types: ['link/click'],
			});

			return timeseries.data.map(row => ({
				...row,
				clicks: row.events,
			}));
		}),

	fmTimeseries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const { dateRange, granularity } = input;

			console.log('fmTimeseries input => ', input);
			const fmTimeseries = await pipe_fmTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});

			return fmTimeseries.data;
		}),

	webEventTimeseries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const timeseries = await pipe_webHitsTimeseries({
				...input,
				// handle: ctx.workspace.handle,
				workspaceId: ctx.workspace.id,
				// assetId: 'fm_uDqzp8X1E8mnefmM',
				// types: ['page/view'],
			});

			return timeseries.data;
		}),

	topBrowsers: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			console.log('topBrowsers input ', input);

			const topBrowsers = await pipe_topBrowsers({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
			});

			return topBrowsers.data;
		}),

	topDevices: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			console.log('topDevices input ', input);
			const topDevices = await pipe_topDevices({
				...input,
				workspaceId: ctx.workspace?.id,
				timezone: ctx.workspace.timezone,
			});

			return topDevices.data;
		}),

	topOperatingSystems: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topOperatingSystems = await pipe_topOs({
				...input,
				workspaceId: ctx.workspace?.id,
				timezone: ctx.workspace.timezone,
			});

			return topOperatingSystems.data;
		}),

	topCities: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topCities = await pipe_topCities({
				...input,
				workspaceId: ctx.workspace?.id,
				timezone: ctx.workspace.timezone,
			});

			return topCities.data;
		}),

	topRegions: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topRegions = await pipe_topRegions({
				...input,
				workspaceId: ctx.workspace?.id,
				timezone: ctx.workspace.timezone,
			});

			return topRegions.data;
		}),

	topCountries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topCountries = await pipe_topCountries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
			});

			return topCountries.data;
		}),

	topReferers: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topReferers = await pipe_topReferers({
				...input,
				workspaceId: ctx.workspace?.id,
				timezone: ctx.workspace.timezone,
			});

			return topReferers.data;
		}),
});
