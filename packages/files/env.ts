import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// When skipping validation (e.g., in tests), provide mock values
const isTestEnv = !!process.env.SKIP_ENV_VALIDATION;

export const env =
	isTestEnv ?
		{
			AWS_S3_BUCKET_NAME: 'test-bucket',
			AWS_S3_REGION: 'us-east-1',
			AWS_S3_ACCESS_KEY_ID: 'test-access-key',
			AWS_S3_SECRET_ACCESS_KEY: 'test-secret-key',
			NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN: 'test.cloudfront.net',
		}
	:	createEnv({
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
