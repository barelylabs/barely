import type { ACL } from '@uploadthing/shared';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import { env } from '../env';
import { s3 } from './s3';

export async function uploadFileFromUrl({
	url,
	key,
	acl = 'public-read',
	contentDisposition = 'inline',
}: {
	url: string;
	key: string;
	acl?: ACL;
	contentDisposition?: 'inline' | 'attachment';
}) {
	// fetch the file
	const res = await fetch(url);
	const fileBuffer = await res.arrayBuffer();
	const buffer = Buffer.from(fileBuffer);

	// upload the file
	const command = new PutObjectCommand({
		Bucket: env.AWS_S3_BUCKET_NAME,
		Key: key,
		Body: buffer,
		ContentType: res.headers.get('content-type') ?? undefined,
		ContentDisposition: contentDisposition,
		ACL: acl,
	});

	await s3.send(command);

	const fileSize = buffer.length;

	return {
		src: `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
		fileSize,
	};
}
