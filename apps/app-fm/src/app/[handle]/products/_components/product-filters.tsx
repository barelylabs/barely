'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useProductSearchParams } from '~/app/[handle]/products/_components/product-context';

export function ProductFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useProductSearchParams();

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
