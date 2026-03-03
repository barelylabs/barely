'use client';

import { useWorkspace } from '@barely/hooks';

import { Filters } from '~/app/[handle]/_components/filters';
import { useCartOrderSearchParams } from '~/app/[handle]/merch/orders/_components/cart-order-context';

export function CartOrderFilters() {
	const { workspace } = useWorkspace();
	const {
		filters,
		setSearch,
		clearAllFilters,
		toggleFulfilled,
		togglePreorders,
		toggleCanceled,
		toggleBarelyOrders,
	} = useCartOrderSearchParams();

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
			{...(workspace.barelyFulfillmentEligible ?
				{
					showBarelyFulfillments: !!filters.showBarelyOrders,
					toggleBarelyFulfillments: () => void toggleBarelyOrders(),
				}
			:	{})}
		/>
	);
}
