import type { FileRecord } from '@barely/validators';
import type { AllowedFileType, ContentDisposition } from '@uploadthing/shared';
import { ALLOWED_FILE_TYPES, getTypeFromFileName } from '@uploadthing/shared';

import type { AllowedFileExtension } from './types';

export function contentDisposition(
	contentDisposition: ContentDisposition,
	fileName: string,
) {
	return [
		contentDisposition,
		`filename="${encodeURI(fileName)}"`,
		`filename*=UTF-8''${encodeURI(fileName)}`,
	].join('; ');
}

export function getFileKey({
	workspaceId,
	folder,
	fileName,
}: {
	workspaceId: string;
	folder: string;
	fileName: string;
}) {
	return `${workspaceId}/${folder ? folder + '/' : ''}${fileName}`;
}

export function getFileExtension(
	path: string,
	allowedFileExtensions: AllowedFileExtension[],
) {
	const index = path.lastIndexOf('.');
	const ext = index < 0 ? '' : path.substring(index);

	console.log('ext => ', ext);
	if (allowedFileExtensions.includes(ext as AllowedFileExtension)) {
		return ext as AllowedFileExtension;
	}

	return null;
}

export function calculateChunkSize(fileSize: number) {
	const FiveGB = 5 * 2 ** 30;
	const FiveHundredGB = 500 * 2 ** 30;
	const FiveTB = 5 * 2 ** 40;
	if (fileSize <= FiveGB) {
		return 50 * 2 ** 20; // 50MB
	} else if (fileSize <= FiveHundredGB) {
		return 500 * 2 ** 20; // 500MB
	} else if (fileSize <= FiveTB) {
		return Math.ceil(FiveTB / 10000); // use the full 10k allowed parts
	}
	return 500 * 2 ** 20; // 500MB
}

export function metadataToAmzHeaders(metadata: Record<string, string>) {
	return Object.keys(metadata).reduce(
		(acc, key) => {
			const value = metadata[key];
			if (value !== undefined) {
				acc[`x-amz-meta-${key}`] = value;
			}
			return acc;
		},
		{} as Record<string, string>,
	);
}

export function getTotalUploadSize(files: FileRecord[]) {
	const excludedFolders = ['avatars'];

	return files.reduce(
		(totalSize, file) => {
			const fileSizeToAdd = excludedFolders.includes(file.folder) ? 0 : file.size;
			return totalSize + fileSizeToAdd;
		},

		0,
	);
}

export function getFileTypeFromFileName(
	fileName: string,
	allowedFileTypes?: AllowedFileType[],
) {
	const fileType = getTypeFromFileName(
		fileName,
		allowedFileTypes ?? [...ALLOWED_FILE_TYPES],
	);
	return fileType;
}
