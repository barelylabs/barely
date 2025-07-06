'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useEmailBroadcast, useEmailBroadcastSearchParams } from './email-broadcasts-context';

export function EmailBroadcastFilters() {
	const { filters } = useEmailBroadcast();
	const { setSearch, toggleArchived, clearAllFilters } = useEmailBroadcastSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={(value) => void setSearch(value)}
			showArchived={filters.showArchived}
			toggleArchived={() => void toggleArchived()}
			clearAllFilters={() => void clearAllFilters()}
		/>
	);
}
