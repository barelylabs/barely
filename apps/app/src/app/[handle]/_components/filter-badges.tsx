import type { StdWebEventPipeQueryParams } from '@barely/tb/schema';
import { useWebEventStatFilters } from '@barely/hooks';
import { capitalize } from '@barely/utils';

import { Badge } from '@barely/ui/badge';

export function WebEventFilterBadges(props: {
	filters: [keyof StdWebEventPipeQueryParams, string][];
}) {
	const { filters } = props;
	const { removeFilter } = useWebEventStatFilters();

	const filterBadges = filters.map(([key, value]) => {
		return (
			<Badge
				key={key}
				className='mr-2'
				variant='muted'
				onRemove={() => removeFilter(key)}
				removeButton
				shape='rectangle'
			>
				{key === 'os' ? 'OS' : capitalize(key)}
				<span className='ml-2 font-bold'>{value.toString()}</span>
			</Badge>
		);
	});

	return <>{filterBadges}</>;
}
