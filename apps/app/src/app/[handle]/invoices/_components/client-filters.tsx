'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useClientSearchParams } from '~/app/[handle]/invoices/_components/client-context';

export function ClientFilters() {
	const { filters, setSearch, clearAllFilters, toggleArchived } = useClientSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
		/>
		// <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
		// 	<div className='flex flex-1 items-center gap-2'>
		// 		<div className='relative w-full max-w-sm'>
		// 			<Icon.search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
		// 			<Input
		// 				placeholder='Search clients...'
		// 				value={search}
		// 				onChange={e => setSearch(e.target.value)}
		// 				className='pl-9'
		// 			/>
		// 		</div>
		// 	</div>
		// 	<div className='flex items-center gap-2'>
		// 		<Button
		// 			look={showArchived ? 'secondary' : 'ghost'}
		// 			size='sm'
		// 			onClick={toggleArchived}
		// 		>
		// 			<Icon.archive className='mr-2 h-4 w-4' />
		// 			{showArchived ? 'Hide' : 'Show'} Archived
		// 		</Button>
		// 	</div>
		// </div>
	);
}
