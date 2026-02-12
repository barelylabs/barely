/**
 * Exchange rate for converting USD to GBP.
 * Used when Barely fulfills orders from US warehouse for UK-based artists.
 *
 * TODO: Replace with dynamic rate fetched from exchange rate API and stored in Redis.
 * This should be updated daily via a scheduled job.
 */
export const USD_TO_GBP_RATE = 0.79;

/**
 * Convert an amount from USD cents to GBP cents.
 * Used for shipping rates when Barely fulfills from US for GBP workspaces.
 */
export function convertUsdToGbpCents(amountInUsdCents: number): number {
	return Math.round(amountInUsdCents * USD_TO_GBP_RATE);
}

export function formatMinorToMajorCurrency(
	amountInMinor: number,
	currency: 'usd' | 'gbp',
) {
	const amount = amountInMinor / 100;
	const formattedAmount = new Intl.NumberFormat(currency === 'usd' ? 'en-US' : 'en-GB', {
		style: 'currency',
		currency,
	}).format(amount);
	return formattedAmount.endsWith('.00') ? formattedAmount.slice(0, -3) : formattedAmount;
}

export function formatMajorStringToMinorNumber(amountInMinor: string) {
	const amount =
		typeof amountInMinor === 'string' ?
			parseFloat(amountInMinor.replace(/^[$£€¥]/, ''))
		:	amountInMinor;
	return Math.round(amount * 100);
}

export function handleCurrencyMinorStringOrMajorNumber(amount: string | number) {
	if (typeof amount === 'number') {
		return amount;
	}

	// Handle empty string case
	if (amount === '') {
		return 0;
	}

	const sanitizedAmount =
		typeof amount === 'string' ? parseFloat(amount.replace(/^[$£€¥]/, '')) : amount;

	// Handle NaN case (e.g., when parseFloat fails)
	if (isNaN(sanitizedAmount)) {
		return 0;
	}

	return sanitizedAmount * 100;
}
