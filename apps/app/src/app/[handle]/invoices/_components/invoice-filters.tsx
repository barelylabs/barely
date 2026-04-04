'use client';

import { INVOICE_FILTER_STATUSES } from '@barely/validators';

import { Filters } from '~/app/[handle]/_components/filters';
import { useInvoiceSearchParams } from '~/app/[handle]/invoices/_components/invoice-context';

const STATUS_LABELS: Record<string, string> = {
	created: 'Draft',
	sent: 'Sent',
	viewed: 'Viewed',
	paid: 'Paid',
	overdue: 'Overdue',
	voided: 'Voided',
};

export function InvoiceFilters() {
	const {
		filters,
		setSearch,
		setStatus,
		setSortBy,
		setSortOrder,
		setDateFrom,
		setDateTo,
		clearAllFilters,
		toggleArchived,
	} = useInvoiceSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
			status={filters.status}
			setStatus={setStatus}
			statusOptions={INVOICE_FILTER_STATUSES.map(status => ({
				label: STATUS_LABELS[status] ?? status,
				value: status,
			}))}
			sortBy={filters.sortBy || 'createdAt'}
			setSortBy={setSortBy}
			sortOrder={
				filters.sortOrder === 'asc' || filters.sortOrder === 'desc' ?
					filters.sortOrder
				:	'desc'
			}
			setSortOrder={setSortOrder}
			sortByOptions={[
				{ label: 'Date Created', value: 'createdAt', icon: 'calendar' },
				{ label: 'Due Date', value: 'dueDate', icon: 'clock' },
				{ label: 'Amount', value: 'total', icon: 'value' },
			]}
			dateFrom={filters.dateFrom}
			setDateFrom={setDateFrom}
			dateTo={filters.dateTo}
			setDateTo={setDateTo}
		/>
	);
}
