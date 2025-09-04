'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useBiosSearchParams } from '~/app/[handle]/bios/_components/bio-context';

export function BioFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useBiosSearchParams();

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
