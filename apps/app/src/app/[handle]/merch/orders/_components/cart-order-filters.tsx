'use client';

import { useWorkspace } from '@barely/hooks';

import { Label } from '@barely/ui/label';
import { Switch } from '@barely/ui/switch';

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

	const showFulfillmentFilter = workspace.barelyFulfillmentEligible;

	return (
		<div className='flex flex-row items-center gap-4'>
			{showFulfillmentFilter && (
				<div className='flex flex-row items-center gap-2'>
					<Switch
						id='showBarelyOrdersSwitch'
						checked={!!filters.showBarelyOrders}
						onClick={() => toggleBarelyOrders()}
						size='sm'
					/>
					<Label htmlFor='showBarelyOrdersSwitch' className='text-sm'>
						Include Barely orders
					</Label>
				</div>
			)}
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
		</div>
	);
}
