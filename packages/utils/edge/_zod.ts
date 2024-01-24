import { z } from 'zod';
import { hash } from '.';

export const optStr_hash = z
	.string()
	.optional()
	.transform(str => hash.sha256(str));

export const optStr_lowerCase_hash = z
	.string()
	.optional()
	.transform(s => hash.sha256(s?.toLowerCase()));
