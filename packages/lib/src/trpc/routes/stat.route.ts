import type { FmPage, Link } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { FmPages } from '@barely/db/sql/fm.sql';
import { Links } from '@barely/db/sql/link.sql';
import { Tracks } from '@barely/db/sql/track.sql';
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
	pipe_vipTimeseries,
	pipe_vipTopBrowsers,
	pipe_vipTopCities,
	pipe_vipTopCountries,
	pipe_vipTopDevices,
	pipe_vipTopEmailBroadcasts,
	pipe_vipTopEmailTemplates,
	pipe_vipTopFlowActions,
	pipe_vipTopLandingPages,
	pipe_vipTopMetaAds,
	pipe_vipTopMetaAdSets,
	pipe_vipTopMetaCampaigns,
	pipe_vipTopMetaPlacements,
	pipe_vipTopOs,
	pipe_vipTopReferers,
	pipe_vipTopRegions,
	pipe_webHitsTimeseries,
	querySpotifyAlbumStats,
	querySpotifyArtistStats,
	querySpotifyTrackComparison,
	querySpotifyTrackStats,
} from '@barely/tb/query';
import {
	spotifyStatQuerySchema,
	stdWebEventQueryToPipeParamsSchema,
} from '@barely/tb/schema';
import { getIsoDateRangeFromDescription } from '@barely/utils';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { z } from 'zod/v4';

import { workspaceProcedure } from '../trpc';

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

export const statRoute = {
	assetById: workspaceProcedure
		.input(z.object({ assetId: z.string().optional() }))
		.query(async ({ ctx, input }): Promise<AssetByIdResult> => {
			const { assetId } = input;

			if (!assetId) return null;

			if (assetId.startsWith('fm_')) {
				const fmPage = await dbHttp.query.FmPages.findFirst({
					where: and(eq(FmPages.id, assetId), eq(FmPages.workspaceId, ctx.workspace.id)),
				});

				if (!fmPage) return null;

				return {
					type: 'fm',
					fmPage,
				} as const;
			}

			if (assetId.startsWith('link_')) {
				const link = await dbHttp.query.Links.findFirst({
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

	linkTimeseries: workspaceProcedure
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

	cartTimeseries: workspaceProcedure
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

	fmTimeseries: workspaceProcedure
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

	pageTimeseries: workspaceProcedure
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

	vipTimeseries: workspaceProcedure
		.input(stdWebEventQueryToPipeParamsSchema)
		.query(async ({ ctx, input }) => {
			const { dateRange, granularity } = input;
			console.log('vipTimeseries input => ', input);
			const vipTimeseries = await pipe_vipTimeseries({
				...input,
				workspaceId: ctx.workspace.id,
				timezone: ctx.workspace.timezone,
				granularity: granularity ?? (dateRange === '1d' ? 'hour' : 'day'),
			});
			return vipTimeseries.data;
		}),

	webEventTimeseries: workspaceProcedure
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

	topBrowsers: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topBrowsers = await pipe_vipTopBrowsers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topBrowsers.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topDevices: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topDevices = await pipe_vipTopDevices({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topDevices.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topOperatingSystems: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topOperatingSystems = await pipe_vipTopOs({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topOperatingSystems.data;
			}

			throw new Error('Invalid topEventType');
		}),

	/* 🌎 locations */
	topCities: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topCities = await pipe_vipTopCities({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCities.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topRegions: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topRegions = await pipe_vipTopRegions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topRegions.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topCountries: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topCountries = await pipe_vipTopCountries({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topCountries.data;
			}

			throw new Error('Invalid topEventType');
		}),

	/* 🔗 referrers */
	topReferers: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topReferers = await pipe_vipTopReferers({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topReferers.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaCampaigns: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topMetaCampaigns = await pipe_vipTopMetaCampaigns({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaCampaigns.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaAdSets: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topMetaAdSets = await pipe_vipTopMetaAdSets({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAdSets.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaAds: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topMetaAds = await pipe_vipTopMetaAds({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaAds.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topMetaPlacements: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topMetaPlacements = await pipe_vipTopMetaPlacements({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topMetaPlacements.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topLandingPages: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topLandingPages = await pipe_vipTopLandingPages({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topLandingPages.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topEmailBroadcasts: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topEmailBroadcasts = await pipe_vipTopEmailBroadcasts({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailBroadcasts.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topEmailTemplates: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topEmailTemplates = await pipe_vipTopEmailTemplates({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topEmailTemplates.data;
			}

			throw new Error('Invalid topEventType');
		}),

	topFlowActions: workspaceProcedure
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

			if (
				input.topEventType === 'vip/view' ||
				input.topEventType === 'vip/emailCapture' ||
				input.topEventType === 'vip/download'
			) {
				const topFlowActions = await pipe_vipTopFlowActions({
					...input,
					workspaceId: ctx.workspace.id,
					timezone: ctx.workspace.timezone,
				});

				return topFlowActions.data;
			}

			throw new Error('Invalid topEventType');
		}),

	spotifyArtistTimeseries: workspaceProcedure
		.input(spotifyStatQuerySchema)
		.query(async ({ ctx, input }) => {
			const dateRange =
				input.start && input.end ?
					{ start: input.start, end: input.end }
				:	getIsoDateRangeFromDescription(input.dateRange);

			const timeseries = await querySpotifyArtistStats({
				workspaceId: ctx.workspace.id,
				start: dateRange.start,
				end: dateRange.end,
				timezone: ctx.workspace.timezone,
			});

			return timeseries.data;
		}),

	spotifyTrackTimeseries: workspaceProcedure
		.input(
			spotifyStatQuerySchema.extend({
				trackId: z.string().optional(), // Keep for backward compatibility
				trackIds: z.array(z.string()).optional(), // New array support
			}),
		)
		.query(async ({ ctx, input }) => {
			const dateRange =
				input.start && input.end ?
					{ start: input.start, end: input.end }
				:	getIsoDateRangeFromDescription(input.dateRange);

			// Handle both single trackId and multiple trackIds
			let trackIds: string[] = [];
			if (input.trackIds && input.trackIds.length > 0) {
				trackIds = input.trackIds;
			} else if (input.trackId) {
				trackIds = [input.trackId];
			}

			// If no track IDs provided, get the track with highest popularity
			if (trackIds.length === 0) {
				const topTrack = await dbHttp.query.Tracks.findFirst({
					where: and(
						eq(Tracks.workspaceId, ctx.workspace.id),
						isNotNull(Tracks.spotifyId),
					),
					orderBy: desc(Tracks.spotifyPopularity),
					columns: {
						id: true,
						name: true,
						spotifyId: true,
					},
				});

				if (topTrack) {
					trackIds = [topTrack.id];
				}
			}

			// Get Spotify IDs for all selected tracks
			const tracks = await dbHttp.query.Tracks.findMany({
				where: and(
					inArray(Tracks.id, trackIds),
					eq(Tracks.workspaceId, ctx.workspace.id),
					isNotNull(Tracks.spotifyId),
				),
				columns: {
					id: true,
					name: true,
					spotifyId: true,
				},
			});

			// Query stats for each track
			const allTimeseries = [];
			for (const track of tracks) {
				if (!track.spotifyId) continue;

				const timeseries = await querySpotifyTrackStats({
					workspaceId: ctx.workspace.id,
					...dateRange,
					spotifyId: track.spotifyId,
					granularity: 'day',
					timezone: ctx.workspace.timezone,
				});

				// Add track metadata to each result
				allTimeseries.push(
					...timeseries.data.map(row => ({
						...row,
						trackId: track.id,
						trackName: track.name,
					})),
				);
			}

			return allTimeseries;
		}),

	spotifyAlbumTimeseries: workspaceProcedure
		.input(spotifyStatQuerySchema)
		.query(async ({ ctx, input }) => {
			const dateRange =
				input.start && input.end ?
					{ start: input.start, end: input.end }
				:	getIsoDateRangeFromDescription(input.dateRange);

			const timeseries = await querySpotifyAlbumStats({
				workspaceId: ctx.workspace.id,
				start: dateRange.start,
				end: dateRange.end,
				spotifyId: input.spotifyId,
				timezone: ctx.workspace.timezone,
			});

			return timeseries.data;
		}),

	spotifyTrackComparison: workspaceProcedure
		.input(
			z.object({
				trackId: z.string(),
				dateRange: z.enum(['1d', '1w', '28d', '1y']).optional().default('28d'),
				start: z.string().optional(),
				end: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const dateRange =
				input.start && input.end ?
					{ start: input.start, end: input.end }
				:	getIsoDateRangeFromDescription(input.dateRange);

			const comparison = await querySpotifyTrackComparison({
				workspaceId: ctx.workspace.id,
				spotifyId: input.trackId,
				start: dateRange.start,
				end: dateRange.end,
				timezone: ctx.workspace.timezone,
			});

			return comparison.data;
		}),
} satisfies TRPCRouterRecord;
