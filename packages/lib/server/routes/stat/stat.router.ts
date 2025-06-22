import { and, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { FmPage } from '../fm/fm.schema';
import type { Link } from '../link/link.schema';
import { createTRPCRouter, workspaceQueryProcedure } from '../../api/trpc';
import { FmPages } from '../fm/fm.sql';
import { Links } from '../link/link.sql';
import {
	pipe_cartTimeseries,
	pipe_cartTopBrowsers,
	pipe_cartTopCities,
	pipe_cartTopCountries,
	pipe_cartTopDevices,
	pipe_cartTopEmailBroadcasts,
	pipe_cartTopEmailTemplates,
	pipe_cartTopFlowActions,
	pipe_cartTopLandingPages,
	pipe_cartTopMetaAds,
	pipe_cartTopMetaAdSets,
	pipe_cartTopMetaCampaigns,
	pipe_cartTopMetaPlacements,
	pipe_cartTopOs,
	pipe_cartTopReferers,
	pipe_cartTopRegions,
	pipe_fmTimeseries,
	pipe_fmTopBrowsers,
	pipe_fmTopCities,
	pipe_fmTopCountries,
	pipe_fmTopDevices,
	pipe_fmTopEmailBroadcasts,
	pipe_fmTopEmailTemplates,
	pipe_fmTopFlowActions,
	pipe_fmTopLandingPages,
	pipe_fmTopMetaAds,
	pipe_fmTopMetaAdSets,
	pipe_fmTopMetaCampaigns,
	pipe_fmTopMetaPlacements,
	pipe_fmTopOs,
	pipe_fmTopReferers,
	pipe_fmTopRegions,
	pipe_linkTimeseries,
	pipe_linkTopBrowsers,
	pipe_linkTopCities,
	pipe_linkTopCountries,
	pipe_linkTopDevices,
	pipe_linkTopEmailBroadcasts,
	pipe_linkTopEmailTemplates,
	pipe_linkTopFlowActions,
	pipe_linkTopLandingPages,
	pipe_linkTopMetaAds,
	pipe_linkTopMetaAdSets,
	pipe_linkTopMetaCampaigns,
	pipe_linkTopMetaPlacements,
	pipe_linkTopOs,
	pipe_linkTopReferers,
	pipe_linkTopRegions,
	pipe_pageTimeseries,
	pipe_pageTopBrowsers,
	pipe_pageTopCities,
	pipe_pageTopCountries,
	pipe_pageTopDevices,
	pipe_pageTopEmailBroadcasts,
	pipe_pageTopEmailTemplates,
	pipe_pageTopFlowActions,
	pipe_pageTopLandingPages,
	pipe_pageTopMetaAds,
	pipe_pageTopMetaAdSets,
	pipe_pageTopMetaCampaigns,
	pipe_pageTopMetaPlacements,
	pipe_pageTopOs,
	pipe_pageTopReferers,
	pipe_pageTopRegions,
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
			const { dateRange, granularity } = input;

			console.log('linkTimeseries input => ', input);

			const linkTimeseries = await pipe_linkTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});

			return linkTimeseries.data;
		}),

	cartTimeseries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const { dateRange, granularity } = input;

			console.log('cartTimeseries input => ', input);

			const cartTimeseries = await pipe_cartTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});

			const purchasesTimeseries = cartTimeseries.data.map(row => ({
				...row,
				// cart_purchases:
				// 	row.cart_mainWithoutBumpPurchases + row.cart_mainWithBumpPurchases,
			}));

			return purchasesTimeseries;
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

	pageTimeseries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const { dateRange, granularity } = input;

			console.log('pageTimeseries input => ', input);

			const pageTimeseries = await pipe_pageTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});

			return pageTimeseries.data;
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

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topBrowsers = await pipe_cartTopBrowsers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topBrowsers.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topBrowsers = await pipe_fmTopBrowsers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topBrowsers.data;
			}

			if (input.topEventType === 'link/click') {
				const topBrowsers = await pipe_linkTopBrowsers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topBrowsers.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topBrowsers = await pipe_pageTopBrowsers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topBrowsers.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topDevices: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			console.log('topDevices input ', input);

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topDevices = await pipe_cartTopDevices({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topDevices.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topDevices = await pipe_fmTopDevices({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topDevices.data;
			}

			if (input.topEventType === 'link/click') {
				const topDevices = await pipe_linkTopDevices({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topDevices.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topDevices = await pipe_pageTopDevices({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topDevices.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topOperatingSystems: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			console.log('topOperatingSystems input ', input);

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topOperatingSystems = await pipe_cartTopOs({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topOperatingSystems.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topOperatingSystems = await pipe_fmTopOs({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topOperatingSystems.data;
			}

			if (input.topEventType === 'link/click') {
				const topOperatingSystems = await pipe_linkTopOs({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topOperatingSystems.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topOperatingSystems = await pipe_pageTopOs({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topOperatingSystems.data;
			}

			throw new Error('Invalid topEventType');
		}),

	/* 🌎 locations */
	topCities: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topCities = await pipe_cartTopCities({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCities.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topCities = await pipe_fmTopCities({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCities.data;
			}

			if (input.topEventType === 'link/click') {
				const topCities = await pipe_linkTopCities({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCities.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topCities = await pipe_pageTopCities({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCities.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topRegions: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topRegions = await pipe_cartTopRegions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topRegions.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topRegions = await pipe_fmTopRegions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topRegions.data;
			}

			if (input.topEventType === 'link/click') {
				const topRegions = await pipe_linkTopRegions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topRegions.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topRegions = await pipe_pageTopRegions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topRegions.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topCountries: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topCountries = await pipe_cartTopCountries({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCountries.data;
			}

			if (input.topEventType === 'fm/view' || input.topEventType === 'fm/linkClick') {
				const topCountries = await pipe_fmTopCountries({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCountries.data;
			}

			if (input.topEventType === 'link/click') {
				const topCountries = await pipe_linkTopCountries({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCountries.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topCountries = await pipe_pageTopCountries({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				console.log('topCountries.data ', topCountries.data);

				return topCountries.data;
			}

			throw new Error('Invalid topEventType');
		}),

	/* 🔗 referrers */
	topReferers: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topReferers = await pipe_cartTopReferers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topReferers.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topReferers = await pipe_fmTopReferers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topReferers.data;
			}

			if (input.topEventType === 'link/click') {
				const topReferers = await pipe_linkTopReferers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topReferers.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topReferers = await pipe_pageTopReferers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topReferers.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaCampaigns: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topMetaCampaigns = await pipe_cartTopMetaCampaigns({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaCampaigns.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topMetaCampaigns = await pipe_fmTopMetaCampaigns({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaCampaigns.data;
			}

			if (input.topEventType === 'link/click') {
				const topMetaCampaigns = await pipe_linkTopMetaCampaigns({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaCampaigns.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topMetaCampaigns = await pipe_pageTopMetaCampaigns({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaCampaigns.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaAdSets: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topMetaAdSets = await pipe_cartTopMetaAdSets({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAdSets.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topMetaAdSets = await pipe_fmTopMetaAdSets({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAdSets.data;
			}

			if (input.topEventType === 'link/click') {
				const topMetaAdSets = await pipe_linkTopMetaAdSets({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAdSets.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topMetaAdSets = await pipe_pageTopMetaAdSets({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAdSets.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaAds: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topMetaAds = await pipe_cartTopMetaAds({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAds.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topMetaAds = await pipe_fmTopMetaAds({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAds.data;
			}

			if (input.topEventType === 'link/click') {
				const topMetaAds = await pipe_linkTopMetaAds({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAds.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topMetaAds = await pipe_pageTopMetaAds({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAds.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaPlacements: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topMetaPlacements = await pipe_cartTopMetaPlacements({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaPlacements.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topMetaPlacements = await pipe_fmTopMetaPlacements({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaPlacements.data;
			}

			if (input.topEventType === 'link/click') {
				const topMetaPlacements = await pipe_linkTopMetaPlacements({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaPlacements.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topMetaPlacements = await pipe_pageTopMetaPlacements({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaPlacements.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topLandingPages: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topLandingPages = await pipe_cartTopLandingPages({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topLandingPages.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topLandingPages = await pipe_fmTopLandingPages({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topLandingPages.data;
			}

			if (input.topEventType === 'link/click') {
				const topLandingPages = await pipe_linkTopLandingPages({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topLandingPages.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topLandingPages = await pipe_pageTopLandingPages({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topLandingPages.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topEmailBroadcasts: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topEmailBroadcasts = await pipe_cartTopEmailBroadcasts({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailBroadcasts.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topEmailBroadcasts = await pipe_fmTopEmailBroadcasts({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailBroadcasts.data;
			}

			if (input.topEventType === 'link/click') {
				const topEmailBroadcasts = await pipe_linkTopEmailBroadcasts({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailBroadcasts.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topEmailBroadcasts = await pipe_pageTopEmailBroadcasts({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailBroadcasts.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topEmailTemplates: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topEmailTemplates = await pipe_cartTopEmailTemplates({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailTemplates.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topEmailTemplates = await pipe_fmTopEmailTemplates({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailTemplates.data;
			}

			if (input.topEventType === 'link/click') {
				const topEmailTemplates = await pipe_linkTopEmailTemplates({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailTemplates.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topEmailTemplates = await pipe_pageTopEmailTemplates({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailTemplates.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topFlowActions: workspaceQueryProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			if (!input.topEventType) {
				throw new Error('topEventType is required');
			}

			if (
				input.topEventType === 'cart/viewCheckout' ||
				input.topEventType === 'cart/checkoutPurchase'
			) {
				const topFlowActions = await pipe_cartTopFlowActions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topFlowActions.data;
			}

			if (input.topEventType === 'fm/linkClick' || input.topEventType === 'fm/view') {
				const topFlowActions = await pipe_fmTopFlowActions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topFlowActions.data;
			}

			if (input.topEventType === 'link/click') {
				const topFlowActions = await pipe_linkTopFlowActions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topFlowActions.data;
			}

			if (input.topEventType === 'page/view' || input.topEventType === 'page/linkClick') {
				const topFlowActions = await pipe_pageTopFlowActions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topFlowActions.data;
			}

			throw new Error('Invalid topEventType');
		}),
});
