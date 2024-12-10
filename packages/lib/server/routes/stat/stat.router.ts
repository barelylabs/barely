import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import type { FmPage } from '../fm/fm.schema';
import type { Link } from '../link/link.schema';
import { createTRPCRouter, workspaceQueryProcedure } from '../../api/trpc';
import { FmPages } from '../fm/fm.sql';
import { Links } from '../link/link.sql';
import {
	fmTimeseriesPipeParamsSchema,
	fmTimeseriesQueryToPipeParamsSchema,
	pipe_fmTimeseries,
	pipe_webHitsTimeseries,
	pipe_webSourcesTopBrowsers,
	pipe_webSourcesTopCities,
	pipe_webSourcesTopCountries,
	pipe_webSourcesTopDevices,
	pipe_webSourcesTopOs,
	pipe_webSourcesTopReferers,
	stdWebEventPipeParamsSchema,
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
			const fmTimeseries = await pipe_fmTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});

			console.log('fmTimeseries => ', fmTimeseries.data);

			return fmTimeseries.data;

			// const [visitsResult, clicksResult] = await Promise.allSettled([
			// 	pipe_webHitsTimeseries({
			// 		...input,
			// 		workspaceId: ctx.workspace.id,
			// 		types: ['fm/view'],
			// 		timezone: ctx.workspace.timezone,
			// 		// date_from: '2024-12-08',
			// 		// date_to: '2024-12-08',
			// 	}),
			// 	pipe_webHitsTimeseries({
			// 		...input,
			// 		workspaceId: ctx.workspace.id,
			// 		types: ['fm/linkClick'],
			// 		timezone: ctx.workspace.timezone,
			// 		// date_from: '2024-12-08',
			// 		// date_to: '2024-12-08',
			// 	}),
			// ]);

			// const visits =
			// 	visitsResult.status === 'fulfilled' ? visitsResult.value : { data: [] };
			// const clicks =
			// 	clicksResult.status === 'fulfilled' ? clicksResult.value : { data: [] };

			// console.log('visits => ', visits.data);
			// console.log('clicks => ', clicks.data);

			// const merged = visits.data.map((visit, index) => {
			// 	return {
			// 		...visit,
			// 		visits: visit.visits,
			// 		// visits: clicks.data[index]?.visits ?? 0,
			// 		clicks: clicks.data[index]?.visits ?? 0,
			// 	};
			// });

			// if the max date is greater than today, chop off the last day. otherwise chop off the first day
			// const maxDate = new Date(
			// 	Math.max(...merged.map(row => new Date(row.date).getTime())),
			// );
			// if (maxDate > new Date()) {
			// 	merged.pop();
			// } else {
			// 	merged.shift();
			// }

			// return merged;
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
			const topBrowsers = await pipe_webSourcesTopBrowsers({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
			});

			return topBrowsers.data;
		}),

	topDevices: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const topDevices = await pipe_webSourcesTopDevices({
				...input,
				workspaceId: ctx.workspace?.id,
			});

			return topDevices.data;
		}),

	topOperatingSystems: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!ctx.workspace && !input.assetId) {
				throw new Error('assetId is required');
			}

			const topOperatingSystems = await pipe_webSourcesTopOs({
				...input,
				workspaceId: ctx.workspace?.id,
			});

			return topOperatingSystems.data;
		}),

	topCities: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			console.log('cities workspaceId : ', ctx.workspace?.id);
			if (!ctx.workspace && !input.assetId) {
				throw new Error('assetId is required');
			}

			const topCities = await pipe_webSourcesTopCities({
				...input,
				workspaceId: ctx.workspace?.id,
			});

			return topCities.data;
		}),

	topCountries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const props = stdWebEventPipeParamsSchema.parse({
				...input,
				workspaceId: ctx.workspace?.id,
			});

			console.log('country props : ', props);

			const topCountries = await pipe_webSourcesTopCountries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				types: ['link/click', 'transparentLinkClick', 'shortLinkClick'], //fixme remove deprecated types
			});

			console.log('topCountries => ', topCountries);

			return topCountries.data;
		}),

	topReferers: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!ctx.workspace && !input.assetId) {
				throw new Error('assetId is required');
			}

			const topReferers = await pipe_webSourcesTopReferers({
				...input,
				workspaceId: ctx.workspace?.id,
			});

			return topReferers.data;
		}),
});
