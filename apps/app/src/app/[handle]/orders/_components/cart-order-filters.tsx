'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CartOrderFilters() {
	const {
		filters,
		setSearch,
		clearAllFilters,
		toggleFulfilled,
		togglePreorders,
		toggleCanceled,
	} = useCartOrderContext();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			searchPlaceholder='Search by fan...'
			showArchived={filters.showArchived}
			showFulfilled={filters.showFulfilled}
			showPreorders={filters.showPreorders}
			showCanceled={filters.showCanceled}
			toggleFulfilled={toggleFulfilled}
			togglePreorders={togglePreorders}
			toggleCanceled={toggleCanceled}
			clearAllFilters={clearAllFilters}
		/>
	);
}
