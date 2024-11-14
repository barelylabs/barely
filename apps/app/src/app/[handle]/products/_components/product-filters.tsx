'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useProductContext } from '~/app/[handle]/products/_components/product-context';

export function ProductFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } = useProductContext();

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
