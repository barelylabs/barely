'use client';

import type { TrackSortBy } from '@barely/lib/server/routes/track/track.schema';
import { sortByOptions } from '@barely/lib/server/routes/track/track.schema';

import { Filters } from '~/app/[handle]/_components/filters';
import { useTrackContext } from '~/app/[handle]/tracks/_components/track-context';

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
	} = useTrackContext();

	return (
		<Filters<TrackSortBy>
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			groupBy={groupByAlbum}
			toggleGroupBy={toggleGroupByAlbum}
			groupByLabel='Group by Album'
			// groupByOptions={[{ label: 'Album', value: 'album' }]}
			clearAllFilters={clearAllFilters}
			sortBy={filters.sortBy ?? 'name'}
			setSortBy={setSortBy}
			sortOrder={filters.sortOrder ?? 'asc'}
			setSortOrder={setSortOrder}
			sortByOptions={sortByOptions}
		/>
	);
}
