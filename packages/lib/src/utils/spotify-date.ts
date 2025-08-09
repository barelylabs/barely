/**
 * Normalizes Spotify release dates to PostgreSQL-compatible format
 * Spotify can return dates in various formats:
 * - "2023-01-15" (full date)
 * - "2023-01" (year and month)
 * - "2023" (year only)
 *
 * @param releaseDate - The release date from Spotify
 * @param precision - The precision of the date (day, month, or year)
 * @returns A normalized date string in YYYY-MM-DD format
 */
export function normalizeSpotifyDate(releaseDate: string, _precision?: string): string {
	// If it's already a full date, return as is
	if (/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
		return releaseDate;
	}

	// If it's year-month format, append -01 for the first day
	if (/^\d{4}-\d{2}$/.test(releaseDate)) {
		return `${releaseDate}-01`;
	}

	// If it's year only, append -01-01 for January 1st
	if (/^\d{4}$/.test(releaseDate)) {
		return `${releaseDate}-01-01`;
	}

	// Fallback: try to parse and default to January 1st if needed
	const parts = releaseDate.split('-');
	const year = parts[0] ?? new Date().getFullYear().toString();
	const month = parts[1]?.padStart(2, '0') ?? '01';
	const day = parts[2]?.padStart(2, '0') ?? '01';

	return `${year}-${month}-${day}`;
}
