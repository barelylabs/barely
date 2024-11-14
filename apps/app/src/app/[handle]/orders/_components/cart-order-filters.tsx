'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

// export function CartOrderFilters() {
// 	const { filters, clearAllFilters, toggleFulfilled } = useCartOrderContext();

// 	const searchInputRef = useRef<HTMLInputElement>(null);

// 	const showClearButton = filters.search ?? filters.showFulfilled;

// 	return (
// 		<div className='flex h-fit w-fit flex-col gap-4 rounded-md border p-6 py-6'>
// 			<div className='flex flex-col gap-3'>
// 				<div className='flex h-6 flex-row items-end justify-between'>
// 					<Text className='text-left' variant='lg/semibold'>
// 						Filters
// 					</Text>
// 					{showClearButton ?
// 						<Button
// 							look='outline'
// 							size='sm'
// 							onClick={() => {
// 								if (searchInputRef.current) {
// 									searchInputRef.current.value = '';
// 								}
// 								clearAllFilters();
// 							}}
// 						>
// 							<Icon.x className='mr-1 h-3 w-3' />
// 							Clear
// 						</Button>
// 					:	null}
// 				</div>
// 			</div>

// 			<div className='flex flex-row items-center justify-between gap-4'>
// 				<Label htmlFor='showArchivedSwitch'>Include fulfilled orders</Label>
// 				<Switch
// 					id='showFulfilledSwitch'
// 					checked={!!filters.showFulfilled}
// 					onClick={() => toggleFulfilled()}
// 					size='sm'
// 				/>
// 			</div>
// 		</div>
// 	);
// }

export function CartOrderFilters() {
	const { filters, setSearch, clearAllFilters, toggleFulfilled } = useCartOrderContext();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			searchPlaceholder='Search by fan...'
			showArchived={filters.showArchived}
			showFulfilled={filters.showFulfilled}
			toggleFulfilled={toggleFulfilled}
			clearAllFilters={clearAllFilters}
		/>
	);
}
