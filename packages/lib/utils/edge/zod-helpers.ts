import { z } from 'zod';

import { sha256 } from './hash';

const z_optStr_hash = z
	.string()
	.optional()
	.transform(str => sha256(str));

const z_optStr_lowerCase_hash = z
	.string()
	.optional()
	.transform(s => sha256(s?.toLowerCase()));

export { z_optStr_hash, z_optStr_lowerCase_hash };
