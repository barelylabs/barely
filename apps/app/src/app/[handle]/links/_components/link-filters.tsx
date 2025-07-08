'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useLinkSearchParams } from '~/app/[handle]/links/_components/link-context';

export function LinkFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useLinkSearchParams();

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
