import { useCallback, useMemo } from 'react';

import { stdWebEventPipeQueryParamsSchema } from '../server/routes/stat/stat.schema';
import { platformFiltersSchema } from '../utils/filters';
import { getDateFromIsoString } from '../utils/format-date';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';
import { useWorkspace } from './use-workspace';

export function useFmStatFilters() {
	const q = useTypedOptimisticQuery(
		stdWebEventPipeQueryParamsSchema.merge(platformFiltersSchema),
	);

	const { handle } = useWorkspace();

	const formatTimestamp = useCallback(
		(d: string) => {
			const date = getDateFromIsoString(d);

			switch (q.data.dateRange) {
				case '1d':
					return new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
					});
				default: {
					const formatted = new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
					});
					console.log('formatted => ', formatted);
					return formatted;
				}
			}
		},

		[q.data.dateRange],
	);

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
			([key, value]) => value !== undefined && key !== 'assetId' && key !== 'dateRange',
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
