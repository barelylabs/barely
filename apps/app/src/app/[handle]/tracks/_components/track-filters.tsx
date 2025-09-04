'use client';

import type { TrackSortBy } from '@barely/validators';
import { sortByOptions } from '@barely/validators';

import { Filters } from '~/app/[handle]/_components/filters';
import { useTrack } from '~/app/[handle]/tracks/_components/track-context';

export function TrackFilters() {
	const {
		filters,
		setSearch,
		setSortBy,
		setSortOrder,
		toggleArchived,
		groupByAlbum,
		toggleGroupByAlbum,
		clearAllFilters,
	} = useTrack();

	return (
		<Filters<TrackSortBy>
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			groupBy={groupByAlbum}
			toggleGroupBy={toggleGroupByAlbum}
			groupByLabel='Group by Album'
			clearAllFilters={clearAllFilters}
			sortBy={filters.sortBy}
			setSortBy={setSortBy}
			sortOrder={filters.sortOrder}
			setSortOrder={setSortOrder}
			sortByOptions={sortByOptions}
		/>
	);
}
