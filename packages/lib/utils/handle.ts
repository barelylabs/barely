export function convertToHandle(str: string) {
	return str.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}
