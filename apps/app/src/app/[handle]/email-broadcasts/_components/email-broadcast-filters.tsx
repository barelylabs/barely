'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useEmailBroadcastsContext } from './email-broadcasts-context';

export function EmailBroadcastFilters() {
	const { clearAllFilters } = useEmailBroadcastsContext();

	return (
		<Filters
			// search={filters.search}
			// setSearch={setSearch}
			clearAllFilters={clearAllFilters}
		/>
	);
}
