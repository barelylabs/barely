'use client';

import { INVOICE_STATUSES } from '@barely/db/sql';

import { Filters } from '~/app/[handle]/_components/filters';
import { useInvoiceSearchParams } from '~/app/[handle]/invoices/_components/invoice-context';

export function InvoiceFilters() {
	const { filters, setSearch, setStatus, clearAllFilters, toggleArchived } =
		useInvoiceSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
			status={filters.status}
			setStatus={setStatus}
			statusOptions={INVOICE_STATUSES.map(status => ({ label: status, value: status }))}
		/>
		// <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
		// 	<div className='flex flex-1 items-center gap-2'>
		// 		<div className='relative w-full max-w-sm'>
		// 			<Icon.search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
		// 			<Input
		// 				placeholder='Search invoices...'
		// 				value={search}
		// 				onChange={e => setSearch(e.target.value)}
		// 				className='pl-9'
		// 			/>
		// 		</div>
		// 		<Select value={status} onValueChange={setStatus}>
		// 			<SelectTrigger className='w-[180px]'>
		// 				<SelectValue placeholder='All statuses' />
		// 			</SelectTrigger>
		// 			<SelectContent>
		// 				<SelectItem value='all'>All statuses</SelectItem>
		// 				<SelectItem value='draft'>Draft</SelectItem>
		// 				<SelectItem value='sent'>Sent</SelectItem>
		// 				<SelectItem value='viewed'>Viewed</SelectItem>
		// 				<SelectItem value='paid'>Paid</SelectItem>
		// 				<SelectItem value='overdue'>Overdue</SelectItem>
		// 				<SelectItem value='voided'>Voided</SelectItem>
		// 			</SelectContent>
		// 		</Select>
		// 	</div>
		// 	<div className='flex items-center gap-2'>
		// 		<Button
		// 			variant={showArchived ? 'secondary' : 'ghost'}
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
