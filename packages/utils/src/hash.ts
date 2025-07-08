import { sha256 as shaJs256 } from 'sha.js';

const hash = (data?: string) => {
	if (!data) return undefined;
	return new shaJs256().update(data).digest('hex');
};

export { hash, hash as sha256 };
