import type { extensions, types } from '@uploadthing/mime-types';
import type {
	// ACL,
	AllowedFileType,
	ContentDisposition,
	// FileSize,
	// SizeUnit,
} from '@uploadthing/shared';

import type { FileRecord } from '../server/routes/file/file.schema';

export { AllowedFileType };
export type AllowedFileExtension = keyof typeof types;
export type FileContentType = keyof typeof extensions;

// presigned urls (single & multi part)
interface BasePresigned {
	fileRecord: FileRecord;
	s3Key: string;
	name: string;
	contentType: FileContentType;
	contentDisposition: ContentDisposition;
}

export interface SinglePartPresigned extends BasePresigned {
	url: string;
	fields: Record<string, string>;
}

export interface MultiPartPresigned extends BasePresigned {
	urls: string[];
	uploadId: string;
	chunkSize: number;
	chunkCount: number;
}

export type Presigned = SinglePartPresigned | MultiPartPresigned;
