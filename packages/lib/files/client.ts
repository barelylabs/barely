// import type { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import type { ContentDisposition } from '@uploadthing/shared';
import { UploadThingError } from '@uploadthing/shared';

import type { FileRecord } from '../server/file.schema';
import type { MultiPartPresigned, SinglePartPresigned } from './types';
import { contentDisposition } from './utils';

export function generateMimeTypes(fileTypes: string[]) {
	const accepted = fileTypes.map(type => {
		if (type === 'blob') return 'blob';
		if (type === 'pdf') return 'application/pdf';
		if (type.includes('/')) return type;
		else return `${type}/*`;
	});

	if (accepted.includes('blob')) {
		return undefined;
	}
	return accepted;
}

export function generateClientDropzoneAccept(fileTypes: string[]) {
	const mimeTypes = generateMimeTypes(fileTypes);

	if (!mimeTypes) return undefined;

	return Object.fromEntries(mimeTypes.map(type => [type, []]));
}

// what to do as progress is made
export type OnUploadProgress = (p: { file: string; progress: number }) => void;

export type OnSinglePartUploadedFromClient = (p: {
	fileId: string;
	key: string;
}) => Promise<FileRecord>;

export type OnAllPartsUploadedFromClient = (p: {
	fileId: string;
	key: string;
	uploadId: string;
	parts: { tag: string; partNumber: number }[];
}) => Promise<FileRecord>;

export type OnUploadComplete = (fileRecord: FileRecord) => void | Promise<void>;

export async function uploadPresignedPost(
	file: File,
	presigned: SinglePartPresigned,
	opts: {
		onUploadProgress?: OnUploadProgress;
		onSinglePartUploadedFromClient?: OnSinglePartUploadedFromClient;
		onUploadComplete?: OnUploadComplete;
	} = {},
) {
	const formData = new FormData();

	Object.entries(presigned.fields).forEach(([k, v]) => formData.append(k, v));
	formData.append('file', file); // File data **MUST GO LAST**

	console.log('presignedPost formData: ', formData);

	const response = await new Promise<XMLHttpRequest>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', presigned.url);
		xhr.setRequestHeader('Accept', 'application/xml');

		xhr.upload.onprogress = p => {
			opts.onUploadProgress?.({
				file: file.name,
				progress: (p.loaded / p.total) * 100,
			});
		};
		xhr.onload = e => resolve(e.target as XMLHttpRequest);
		xhr.onerror = e => reject(e);
		xhr.send(formData);
	});

	if (response.status > 299 || response.status < 200) {
		throw new UploadThingError({
			code: 'UPLOAD_FAILED',
			message: 'Failed to upload file',
			cause: response,
		});
	}

	const fileRecord = await opts
		.onSinglePartUploadedFromClient?.({
			fileId: presigned.fileRecord.id,
			key: presigned.key,
		})
		.then(async fileRecord => {
			await opts.onUploadComplete?.(fileRecord);
			return fileRecord;
		});

	return fileRecord;
}

export async function uploadMultipart(
	file: File,
	presigned: MultiPartPresigned,
	opts: {
		onUploadProgress?: OnUploadProgress;
		onAllPartsUploadedFromClient: OnAllPartsUploadedFromClient;
		onUploadComplete?: OnUploadComplete;
	},
) {
	let etags: { tag: string; partNumber: number }[];
	let uploadedBytes = 0;

	try {
		etags = await Promise.all(
			presigned.urls.map(async (url, index) => {
				const offset = presigned.chunkSize * index;
				const end = Math.min(offset + presigned.chunkSize, file.size);
				const chunk = file.slice(offset, end);

				const etag = await uploadPartWithProgress({
					url,
					chunk: chunk,
					contentDisposition: presigned.contentDisposition,
					fileType: file.type,
					fileName: file.name,
					maxRetries: 10,
					onProgress: delta => {
						uploadedBytes += delta;
						const percent = (uploadedBytes / file.size) * 100;
						opts?.onUploadProgress?.({ file: file.name, progress: percent });
					},
				});
				return { tag: etag, partNumber: index + 1 };
			}),
		);
	} catch (error) {
		// fixme - handle error
		// await opts.reportEventToUT("failure", {
		//   fileKey: presigned.key,
		//   uploadId: presigned.uploadId,
		//   fileName: file.name,
		//   s3Error: (error as Error).toString(),
		// });
		console.error('Error uploading multipart', error);
		throw 'unreachable'; // failure event will throw for us
	}

	// Tell the server that the upload is complete
	const fileRecord = (await opts.onAllPartsUploadedFromClient({
		fileId: presigned.fileRecord.id,
		key: presigned.key,
		uploadId: presigned.uploadId,
		parts: etags,
	})) satisfies FileRecord;

	if (!fileRecord) {
		console.error('Failed to complete multipart upload');
		throw new UploadThingError({
			code: 'UPLOAD_FAILED',
			message: 'Failed to complete multipart upload',
		});
	}

	await opts.onUploadComplete?.(fileRecord);

	return fileRecord;
}

export async function uploadPartWithProgress(
	opts: {
		url: string;
		chunk: Blob;
		fileType: string;
		fileName: string;
		contentDisposition: ContentDisposition;
		maxRetries: number;
		onProgress: (progressDelta: number) => void;
	},
	retryCount = 0,
) {
	return new Promise<string>((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open('PUT', opts.url, true);
		xhr.setRequestHeader('Content-Type', opts.fileType);
		xhr.setRequestHeader(
			'Content-Disposition',
			contentDisposition(opts.contentDisposition, opts.fileName),
		);

		xhr.onload = async () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const etag = xhr.getResponseHeader('Etag');
				etag ? resolve(etag) : reject('NO ETAG');
			} else if (retryCount < opts.maxRetries) {
				// Add a delay before retrying (exponential backoff can be used)
				const delay = Math.pow(2, retryCount) * 1000;
				await new Promise(res => setTimeout(res, delay));
				await uploadPartWithProgress(opts, retryCount + 1); // Retry the request
			} else {
				reject('Max retries exceeded');
			}
		};

		let lastProgress = 0;

		xhr.onerror = async () => {
			lastProgress = 0;
			if (retryCount < opts.maxRetries) {
				// Add a delay before retrying (exponential backoff can be used)
				const delay = Math.pow(2, retryCount) * 100;
				await new Promise(res => setTimeout(res, delay));
				await uploadPartWithProgress(opts, retryCount + 1); // Retry the request
			} else {
				reject('Max retries exceeded');
			}
		};

		xhr.upload.onprogress = e => {
			const delta = e.loaded - lastProgress;
			lastProgress += delta;
			opts.onProgress(delta);
		};

		xhr.send(opts.chunk);
	});
}
