'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import {
	useEmailTemplateGroup,
	useEmailTemplateGroupSearchParams,
} from './email-template-group-context';

export function EmailTemplateGroupFilters() {
	const { filters } = useEmailTemplateGroup();
	const { setSearch, toggleArchived, clearAllFilters } =
		useEmailTemplateGroupSearchParams();

	return (
		<Filters
			search={filters.search}
			setSearch={value => void setSearch(value)}
			showArchived={filters.showArchived}
			toggleArchived={() => void toggleArchived()}
			clearAllFilters={() => void clearAllFilters()}
		/>
	);
}
