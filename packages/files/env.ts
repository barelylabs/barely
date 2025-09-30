import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
	server: {
		AWS_S3_BUCKET_NAME: z.string(),
		AWS_S3_REGION: z.string(),
		AWS_S3_ACCESS_KEY_ID: z.string(),
		AWS_S3_SECRET_ACCESS_KEY: z.string(),
	},
	client: {
		NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN: z.string(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN: process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN,
	},
});
