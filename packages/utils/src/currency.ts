export function formatCentsToDollars(amountInCents: number, currency = 'usd') {
	const amount = amountInCents / 100;
	const formattedAmount = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
	return formattedAmount.endsWith('.00') ? formattedAmount.slice(0, -3) : formattedAmount;
}
