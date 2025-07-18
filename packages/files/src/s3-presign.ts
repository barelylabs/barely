import type { FileRecord } from '@barely/validators';
import type { ACL } from '@uploadthing/shared';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { FileContentType, MultiPartPresigned, SinglePartPresigned } from './types';
import { env } from '../env';
import { s3 } from './s3';
import { calculateChunkSize, metadataToAmzHeaders } from './utils';

interface GetPresignedProps {
	fileRecord: FileRecord;
	workspaceId: string;
	s3Key: string;
	name: string;
	fileContentType: FileContentType;
	fileSizeInBytes: number;
	contentDisposition?: 'inline' | 'attachment';
	maxFileCount?: number;
	acl?: ACL;
	metadata?: Record<string, string>;
}

export async function getPresigned({
	fileRecord,
	workspaceId,
	s3Key,
	name,
	fileContentType,
	fileSizeInBytes,
	contentDisposition = 'inline',
	acl = 'public-read',
	metadata = {},
}: GetPresignedProps) {
	const Metadata = {
		...metadata,
	};

	const isSinglePartUpload =
		fileSizeInBytes < 50 * 1024 * 1024 && fileContentType.startsWith('image'); // images smaller than 50MB

	if (isSinglePartUpload) {
		const { url, fields } = await createPresignedPost(s3, {
			Bucket: env.AWS_S3_BUCKET_NAME,
			Key: s3Key,
			Conditions: [
				{ acl },
				['content-length-range', 0, fileSizeInBytes],
				['starts-with', '$Content-Type', 'image/'],
				['starts-with', '$key', `${workspaceId}/`],
			],
			Fields: {
				key: s3Key,
				acl,
				'Content-Type': fileContentType,
				'Content-Disposition': contentDisposition,
				...metadataToAmzHeaders(Metadata),
			},
		});

		return {
			fileRecord,
			s3Key,
			name,
			contentType: fileContentType,
			contentDisposition,
			url,
			fields,
		} satisfies SinglePartPresigned;
	} else {
		const uploadId = (
			await s3.createMultipartUpload({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: s3Key,
				ACL: acl,
				ContentType: fileContentType,
				ContentDisposition: contentDisposition,
				Metadata,
			})
		).UploadId;

		if (!uploadId) {
			throw new Error('Failed to create multipart upload');
		}

		const urls: Promise<string>[] = [];
		const chunkSize = calculateChunkSize(fileSizeInBytes);
		const chunkCount = Math.ceil(fileSizeInBytes / chunkSize);

		for (let i = 1; i <= chunkCount; i++) {
			const uploadPartCommand = new UploadPartCommand({
				Bucket: env.AWS_S3_BUCKET_NAME,
				Key: s3Key,
				UploadId: uploadId,
				PartNumber: i,
			});

			const url = getSignedUrl(s3, uploadPartCommand);

			urls.push(url);
		}

		return {
			fileRecord,
			s3Key,
			name,
			contentType: fileContentType,
			contentDisposition,
			uploadId,
			chunkSize,
			chunkCount,
			urls: await Promise.all(urls),
		} satisfies MultiPartPresigned;
	}
}

export async function completeMultipartUpload({
	bucket = env.AWS_S3_BUCKET_NAME,
	s3Key,
	uploadId,
	parts,
}: {
	bucket?: string;
	s3Key: string;
	uploadId: string;
	parts: {
		tag: string;
		partNumber: number;
	}[];
}) {
	const completeUploadResponse = await s3.completeMultipartUpload({
		Bucket: bucket,
		Key: s3Key,
		UploadId: uploadId,
		MultipartUpload: {
			Parts: parts.map(part => ({
				ETag: part.tag,
				PartNumber: part.partNumber,
			})),
		},
	});

	return completeUploadResponse;
}
