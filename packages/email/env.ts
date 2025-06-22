import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
	server: {
		RESEND_API_KEY: z.string(),
		// EMAIL_LIST_UNSUBSCRIBE_HEADER: z.string(),
	},
	onValidationError: issues => {
		console.error('❌ Invalid environment variables:', issues);
		throw new Error('Invalid environment variables');
	},
	experimental__runtimeEnv: {},
	skipValidation:
		!!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'lint',
});
