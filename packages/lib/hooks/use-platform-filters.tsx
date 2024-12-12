import { useCallback } from 'react';

import { platformFiltersSchema } from '../utils/filters';
import { useTypedOptimisticQuery } from './use-typed-optimistic-query';

export function usePlatformFilters() {
	const q = useTypedOptimisticQuery(platformFiltersSchema);

	const { showSpotify, showAppleMusic, showYoutube, showAmazonMusic, showYoutubeMusic } =
		q.data;

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

	return {
		platformFilters: { ...q.data },
		toggleSpotify,
		toggleAppleMusic,
		toggleYoutube,
		toggleAmazonMusic,
		toggleYoutubeMusic,
	};
}
