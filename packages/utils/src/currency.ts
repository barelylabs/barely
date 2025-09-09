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

	const sanitizedAmount =
		typeof amount === 'string' ? parseFloat(amount.replace(/^[$£€¥]/, '')) : amount;
	return sanitizedAmount * 100;
}
