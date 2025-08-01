import { isStaging } from '@barely/utils';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const tbEnv = createEnv({
	server: {
		TINYBIRD_HOST: z.string(),
		TINYBIRD_STAGING_DEPLOYMENT_ID: z.preprocess(v => {
			if (!isStaging()) return undefined;

			if (typeof v !== 'string' || v === '') return null;

			return v;
		}, z.string().optional()),
	},
	experimental__runtimeEnv: {},
	onValidationError: issues => {
		console.error('❌ Invalid environment variables:', issues);
		throw new Error('Invalid environment variables');
	},
	skipValidation:
		!!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'lint',
});
