export function sanitizeKey(key: string) {
	return key.trim().replace(/[^a-z0-9_-]/g, '-');
}
