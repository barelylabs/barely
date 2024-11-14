'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function FanGroupFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useFanGroupContext();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
		/>
	);
}
