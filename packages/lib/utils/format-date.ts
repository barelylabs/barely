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
				date_from: getIsoDateFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
				date_to: new Date().toISOString().replace(/T.*/, ''),
			};
		case '1w':
			return {
				date_from: getIsoDateFromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
				date_to: getIsoDateFromDate(new Date()),
			};
		case '28d':
			return {
				date_from: getIsoDateFromDate(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)),
				date_to: getIsoDateFromDate(new Date()),
			};
		case '1y':
			return {
				date_from: getIsoDateFromDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
				date_to: getIsoDateFromDate(new Date()),
			};
		default:
			return {
				date_from: getIsoDateFromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
				date_to: getIsoDateFromDate(new Date()),
			};
	}
}

export function getIsoDateFromDate(date: Date) {
	return date.toISOString().replace(/T.*/, '');
}
