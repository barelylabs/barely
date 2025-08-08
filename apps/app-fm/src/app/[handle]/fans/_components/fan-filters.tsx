'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

export function FanFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useFanSearchParams();

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
