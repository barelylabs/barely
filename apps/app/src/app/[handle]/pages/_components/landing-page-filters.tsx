'use client';

import { Filters } from '~/app/[handle]/_components/filters';
import { useLandingPageSearchParams } from '~/app/[handle]/pages/_components/landing-page-context';

export function LandingPageFilters() {
	const { filters, setSearch, toggleArchived, clearAllFilters } =
		useLandingPageSearchParams();

	return (
		<Filters
			{...filters}
			setSearch={setSearch}
			toggleArchived={toggleArchived}
			clearAllFilters={clearAllFilters}
		/>
	);
}
