export function formatMinorToMajorCurrency(
	amountInCents: number,
	currency: 'usd' | 'gbp',
) {
	const amount = amountInCents / 100;
	const formattedAmount = new Intl.NumberFormat(currency === 'usd' ? 'en-US' : 'en-GB', {
		style: 'currency',
		currency,
	}).format(amount);
	return formattedAmount.endsWith('.00') ? formattedAmount.slice(0, -3) : formattedAmount;
}
