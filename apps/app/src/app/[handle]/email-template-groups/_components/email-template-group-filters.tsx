'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useEmailTemplateGroupContext } from './email-template-group-context';

export function EmailTemplateGroupFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useEmailTemplateGroupContext();

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
