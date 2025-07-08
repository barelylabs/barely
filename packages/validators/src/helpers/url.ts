export function isValidUrl(url: string | undefined | null) {
	if (!url) return false;

	try {
		new URL(url);
		return true;
	} catch {
		// if it's not a valid URL, return false
		return false;
	}
}
