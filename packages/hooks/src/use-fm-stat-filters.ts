'use client';

import { useCallback, useMemo } from 'react';
import { fmStatFiltersSchema } from '@barely/validators';

import { useFormatTimestamp } from './use-format-timestamp';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useFmStatFilters() {
	const q = useTypedOptimisticQuery(fmStatFiltersSchema);

	const { handle } = useWorkspace();
	const { formatTimestamp } = useFormatTimestamp(q.data.dateRange);

	const {
		showVisits,
		showClicks,
		showSpotify,
		showAppleMusic,
		showYoutube,
		showAmazonMusic,
		showYoutubeMusic,
		...filters
	} = q.data;

	const toggleShowVisits = useCallback(() => {
		if (showVisits) return q.setQuery('showVisits', false);
		return q.setQuery('showVisits', true);
	}, [showVisits, q]);

	const toggleShowClicks = useCallback(() => {
		if (showClicks) return q.setQuery('showClicks', false);
		return q.setQuery('showClicks', true);
	}, [showClicks, q]);

	const toggleSpotify = useCallback(() => {
		if (showSpotify) return q.removeByKey('showSpotify');
		return q.setQuery('showSpotify', true);
	}, [showSpotify, q]);

	const toggleAppleMusic = useCallback(() => {
		if (showAppleMusic) return q.removeByKey('showAppleMusic');
		return q.setQuery('showAppleMusic', true);
	}, [showAppleMusic, q]);

	const toggleYoutube = useCallback(() => {
		if (showYoutube) return q.removeByKey('showYoutube');
		return q.setQuery('showYoutube', true);
	}, [showYoutube, q]);

	const toggleAmazonMusic = useCallback(() => {
		if (showAmazonMusic) return q.removeByKey('showAmazonMusic');
		return q.setQuery('showAmazonMusic', true);
	}, [showAmazonMusic, q]);

	const toggleYoutubeMusic = useCallback(() => {
		if (showYoutubeMusic) return q.removeByKey('showYoutubeMusic');
		return q.setQuery('showYoutubeMusic', true);
	}, [showYoutubeMusic, q]);

	const badgeFilters = useMemo(() => {
		return Object.entries(filters).filter(
			([key]) => key !== 'assetId' && key !== 'dateRange',
		) as [keyof typeof filters, string][];
	}, [filters]);

	return {
		filters,
		filtersWithHandle: { handle, ...filters },
		getSetFilterPath: q.getSetQueryPath,
		setFilter: q.setQuery,
		removeFilter: q.removeByKey,
		removeAllFilters: q.removeAllQueryParams,
		formatTimestamp,
		badgeFilters,

		uiFilters: {
			showVisits,
			showClicks,
			showSpotify,
			showAppleMusic,
			showYoutube,
			showAmazonMusic,
			showYoutubeMusic,
		},

		toggleShowVisits,
		toggleShowClicks,
		toggleSpotify,
		toggleAppleMusic,
		toggleYoutube,
		toggleAmazonMusic,
		toggleYoutubeMusic,
	};
}
