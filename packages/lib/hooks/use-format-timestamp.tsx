import { useCallback } from 'react';

import type { StatDateRange } from '../server/routes/stat/stat.schema';
import { getDateFromIsoString } from '../utils/format-date';

export function useFormatTimestamp(dateRange?: StatDateRange) {
	const formatTimestamp = useCallback(
		(d: string) => {
			const date = getDateFromIsoString(d);

			switch (dateRange) {
				case '1d':
					return new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
					});
				default: {
					const formatted = new Date(date).toLocaleDateString('en-us', {
						month: 'short',
						day: 'numeric',
					});
					return formatted;
				}
			}
		},
		[dateRange],
	);

	return { formatTimestamp };
}
