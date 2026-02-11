'use client';

import { useWorkspace } from '@barely/hooks';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';

import { Filters } from '~/app/[handle]/_components/filters';
import { useCartOrderSearchParams } from '~/app/[handle]/merch/orders/_components/cart-order-context';

const FULFILLED_BY_OPTIONS = [
	{ value: 'all', label: 'All Orders' },
	{ value: 'artist', label: 'My Fulfillment' },
	{ value: 'barely', label: 'Barely Fulfillment' },
] as const;

export function CartOrderFilters() {
	const { workspace } = useWorkspace();
	const {
		filters,
		setSearch,
		clearAllFilters,
		toggleFulfilled,
		togglePreorders,
		toggleCanceled,
		setFulfilledBy,
	} = useCartOrderSearchParams();

	// Only show fulfillment filter if workspace is eligible for Barely fulfillment
	const showFulfillmentFilter = workspace.barelyFulfillmentEligible;

	return (
		<div className='flex flex-row items-center gap-4'>
			{showFulfillmentFilter && (
				<Select
					value={filters.fulfilledBy ?? 'all'}
					onValueChange={value => setFulfilledBy(value as 'all' | 'artist' | 'barely')}
				>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by fulfillment' />
					</SelectTrigger>
					<SelectContent>
						{FULFILLED_BY_OPTIONS.map(option => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
