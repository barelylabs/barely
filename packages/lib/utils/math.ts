export function chooseMax(a: number | null, b: number | null) {
	if (!a && !b) return null;
	if (!a) return b;
	if (!b) return a;
	return a > b ? a : b;
}
