'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useVipSwapsSearchParams } from './use-vip-swaps';

export function VipFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useVipSwapsSearchParams();

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
