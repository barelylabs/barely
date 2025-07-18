'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useFmSearchParams } from '~/app/[handle]/fm/_components/fm-context';

export function FmFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useFmSearchParams();

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
