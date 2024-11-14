'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useFanContext } from '~/app/[handle]/fans/_components/fan-context';

export function FanFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useFanContext();

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
