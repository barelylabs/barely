import type { StatDateRange } from '@barely/validators/schemas';

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

export function getFirstAndLastDayOfBillingCycle(day: number) {
	const today = new Date();
	const currentDay = today.getDate();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();

	if (currentDay >= day) {
		// if the current day is greater than target day, it means we've passed it
		return {
			firstDay: new Date(currentYear, currentMonth, day),
			lastDay: new Date(currentYear, currentMonth + 1, day - 1),
		};
	} else {
		// if the current day is less than target day, we haven't passed it yet
		const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
		const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

		return {
			firstDay: new Date(lastYear, lastMonth, day),
			lastDay: new Date(lastYear, lastMonth + 1, day - 1),
		};
	}
}

export function formatDateForCountry(
	date: string | number | Date,
	country?: string | null,
): string {
	const dateObj =
		typeof date === 'string' ? new Date(date)
		: typeof date === 'number' ? new Date(date)
		: date;

	// Default to US format if country is not specified or is US
	if (!country || country === 'US' || country === 'USA' || country === 'United States') {
		return dateObj.toLocaleDateString('en-US', {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric',
		});
	}

	// UK format for UK
	if (country === 'UK' || country === 'GB' || country === 'United Kingdom') {
		return dateObj.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}

	// Default to UK format for any other country
	return dateObj.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}
