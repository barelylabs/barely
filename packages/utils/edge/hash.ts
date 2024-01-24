import { sha256 as shaJs256 } from 'sha.js';

export function sha256(data?: string) {
	if (!data) return undefined;
	return new shaJs256().update(data).digest('hex');
}
