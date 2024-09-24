import type { ZodError } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		RESEND_API_KEY: z.string(),
		// EMAIL_LIST_UNSUBSCRIBE_HEADER: z.string(),
	},
	onValidationError: (error: ZodError) => {
		console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
		throw new Error(
			'Invalid environment variables' + JSON.stringify(error.flatten().fieldErrors),
		);
	},
	experimental__runtimeEnv: {},
	skipValidation:
		!!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === 'lint',
});
