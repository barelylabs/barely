'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useEmailTemplateContext } from './email-template-context';

export function EmailTemplateFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useEmailTemplateContext();

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
