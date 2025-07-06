'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useCartFunnelSearchParams } from '~/app/[handle]/carts/_components/cartFunnel-context';

export function CartFunnelFilters() {
	const { filters, setSearch, clearAllFilters, toggleArchived } = useCartFunnelSearchParams();

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
