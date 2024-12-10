import type { StatDateRange } from '../server/routes/stat/stat.schema';

export function formatDate(input: string | number | Date): string {
	const date =
		typeof input === 'string' ? new Date(input)
		: typeof input === 'number' ? new Date(input)
		: input;
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export function getIsoDateRangeFromDescription(range?: StatDateRange) {
	switch (range) {
		case '1d':
			return {
				start: getIsoDateFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
				end: getIsoDateFromDate(new Date()),
				granularity: 'hour' as const,
			};

		// for anything > 1w, we grab an extra day to account for timezone differences
		case '1w':
			return {
				start: getIsoDateFromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
				end: getIsoDateFromDate(new Date()),
				granularity: 'day' as const,
			};
		case '28d':
			return {
				start: getIsoDateFromDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)),
				end: getIsoDateFromDate(new Date()),
				granularity: 'day' as const,
			};
		case '1y':
			return {
				start: getIsoDateFromDate(new Date(Date.now() - 366 * 24 * 60 * 60 * 1000)),
				end: getIsoDateFromDate(new Date()),
				granularity: 'day' as const,
			};
		default:
			return {
				start: getIsoDateFromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
				end: getIsoDateFromDate(new Date()),
				granularity: 'day' as const,
			};
	}
}

export function getIsoDateFromDate(date: Date) {
	return date.toISOString().replace('T', ' ').replace('Z', '');
}

export function getDateFromIsoString(isoString: string) {
	// iso could be in the format of '2024-12-0700:00:00.000-0500'
	// we need to convert it to the format of '2024-12-07T00:00:00.000'

	const fixedDateString = isoString.replace(
		/(\d{4})-(\d{2})-(\d{2})(\d{2}):(\d{2}):(\d{2})\.(\d{3})([-+]\d{4})/,
		'$1-$2-$3T$4:$5:$6.$7$8',
	);

	return new Date(fixedDateString);
}
