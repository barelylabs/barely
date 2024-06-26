import { S3 } from '@aws-sdk/client-s3';

import { env } from '../env';

export const s3 = new S3({
	region: env.AWS_S3_REGION,
	credentials: {
		accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
	},
});
