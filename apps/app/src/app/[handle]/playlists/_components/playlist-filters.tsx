'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { usePlaylistSearchParams } from './playlist-context';

export function PlaylistFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		usePlaylistSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			searchPlaceholder='Search playlists...'
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
			itemsName='playlists'
		/>
	);
}
