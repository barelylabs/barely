'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useEmailTemplateSearchParams } from './email-template-context';

export function EmailTemplateFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useEmailTemplateSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={setSearch}
			showArchived={filters.showArchived}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
		/>
	);
}
