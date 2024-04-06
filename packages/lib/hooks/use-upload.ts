import type { PrimitiveAtom } from 'jotai';
import type { DropzoneOptions } from 'react-dropzone';
import type { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import { useDropzone } from 'react-dropzone';

import type { OnUploadComplete, OnUploadProgress } from '../files/client';
import type { AllowedFileType, Presigned } from '../files/types';
import type { uploadFileSchema } from '../server/routes/file/file.schema';
import {
	generateClientDropzoneAccept,
	uploadMultipart,
	uploadPresignedPost,
} from '../files/client';
import { api } from '../server/api/react';

export interface UseUploadProps extends DropzoneOptions {
	folder?: string;
	maxFiles?: number;
	allowedFileTypes: AllowedFileType[];
	onUploadComplete?: OnUploadComplete;
	uploadQueueAtom: PrimitiveAtom<UploadQueueItem[]>;
	imagePreviews?: boolean;
	onPresigned?: (presigned: Presigned[], uploadQueue?: UploadQueueItem[]) => void;
}

export interface UploadQueueItem {
	file: File;
	presigned: Presigned | null;
	progress: number; // 0-100
	status: 'pendingPresign' | 'readyToUpload' | 'uploading' | 'complete' | 'error';
	previewImage?: string | null;
}

export function useUpload({
	folder = '',
	maxFiles = 0,
	maxSize = 5 * 2 ** 30, // roughly 5GB
	allowedFileTypes,
	onUploadComplete,
	uploadQueueAtom = atom<UploadQueueItem[]>([]),
	onPresigned,
	...props
}: UseUploadProps) {
	const [uploadQueue, setUploadQueue] = useAtom(uploadQueueAtom);
	const [uploading] = useAtom(
		useMemo(
			() => atom(get => get(uploadQueueAtom).some(q => q.status === 'uploading')),
			[uploadQueueAtom],
		),
	);

	const { mutate: getPresigned, isPending: presignedIsPending } =
		api.file.getPresigned.useMutation();

	const { mutateAsync: onAllPartsUploaded } =
		api.file.completeMultiPartUpload.useMutation();

	const { mutateAsync: onSinglePartUploadedFromClient } =
		api.file.completeSinglePartUpload.useMutation();

	const { acceptedFiles, ...useDropzoneReturn } = useDropzone({
		maxFiles,
		maxSize,
		multiple: maxFiles === 0 || maxFiles > 1,
		accept: generateClientDropzoneAccept(allowedFileTypes),
		...props,
		onDrop: (acceptedFiles, _fileRejections, _event) => {
			const handleDrop = async () => {
				const fileData: z.infer<typeof uploadFileSchema>[] = await Promise.all(
					acceptedFiles.map((f): Promise<z.infer<typeof uploadFileSchema>> => {
						return new Promise(resolve => {
							if (f.type.startsWith('image')) {
								const img = new Image();
								img.src = URL.createObjectURL(f);
								img.onload = () => {
									resolve({
										name: f.name,
										size: f.size,
										width: img.width,
										height: img.height,
									});
								};
								img.onerror = () => {
									resolve({
										name: f.name,
										size: f.size,
									});
								};
							} else if (f.type.startsWith('audio')) {
								const audio = new Audio();
								audio.src = URL.createObjectURL(f);
								audio.onloadedmetadata = () => {
									resolve({
										name: f.name,
										size: f.size,
										duration: Math.floor(audio.duration * 1000),
									});
								};
								audio.onerror = () => {
									resolve({
										name: f.name,
										size: f.size,
									});
								};
							} else if (f.type.startsWith('video')) {
								const video = document.createElement('video');
								video.src = URL.createObjectURL(f);
								video.onloadedmetadata = () => {
									resolve({
										name: f.name,
										size: f.size,
										duration: Math.floor(video.duration * 1000), // convert to milliseconds int
										width: video.videoWidth,
										height: video.videoHeight,
									});
								};
								video.onerror = () => {
									resolve({
										name: f.name,
										size: f.size,
									});
								};
							} else {
								resolve({
									name: f.name,
									size: f.size,
								});
							}
						});
					}),
				);

				setUploadQueue(prev => {
					const newQueue = acceptedFiles
						.filter(f => !prev.some(q => q.file.name === f.name))
						.map(f => {
							const previewImage =
								f.type.startsWith('image/') ? URL.createObjectURL(f) : null;

							return {
								file: f,
								presigned: null,
								progress: 0,
								status: 'pendingPresign',
								previewImage,
							} satisfies UploadQueueItem;
						});

					const prevQueue = prev.map(q => {
						if (acceptedFiles.some(f => f.name === q.file.name)) {
							return {
								...q,
								presigned: null,
								progress: 0,
								status: 'pendingPresign',
							} satisfies UploadQueueItem;
						}
						return q;
					});

					const updatedQueue = [...newQueue, ...prevQueue];
					if (maxFiles === 0) return updatedQueue;

					return updatedQueue.slice(0, maxFiles);
				});

				getPresigned(
					{
						files: fileData,
						folder,
						allowedFileTypes,
					},
					{
						onSuccess: presigned => {
							setUploadQueue(prev =>
								prev.map(q => {
									const presignedFile = presigned.find(pu => pu.name === q.file.name);
									if (!presignedFile) {
										if (q.presigned === null) {
											console.error(`No presigned URL found for ${q.file.name}`);
										}
										return q;
									}
									return {
										...q,
										presigned: presignedFile,
										status: 'readyToUpload',
									};
								}),
							);

							onPresigned?.(presigned, uploadQueue);
						},
					},
				);

				props.onDrop?.(acceptedFiles, _fileRejections, _event);
			};

			handleDrop().catch(err => console.error(err));
		},
	});

	const onUploadProgress: OnUploadProgress = useCallback(
		({ file, progress }) => {
			setUploadQueue(prev =>
				prev.map(q => {
					if (q.file.name === file) {
						return { ...q, progress };
					}
					return q;
				}),
			);
		},
		[setUploadQueue],
	);

	const onUploadCompleteCallback: OnUploadComplete = useCallback(
		async fileRecord => {
			await onUploadComplete?.(fileRecord);

			setUploadQueue(prev =>
				prev.map(p => {
					if (fileRecord.id === p.presigned?.fileRecord.id) {
						return { ...p, status: 'complete' };
					}
					return p;
				}),
			);
		},
		[onUploadComplete, setUploadQueue],
	);

	const handleSubmit = useCallback(async () => {
		if (uploadQueue.length > 0 && !uploadQueue.some(q => q.presigned === null)) {
			await Promise.all(
				uploadQueue.map(async item => {
					if (!item.presigned) {
						console.error(`No presigned URL found for ${item.file.name}`);
						return;
					}

					setUploadQueue(prev =>
						prev.map(q => {
							if (q.file.name === item.file.name) {
								return { ...q, status: 'uploading' };
							}
							return q;
						}),
					);
					if ('url' in item.presigned) {
						await uploadPresignedPost(item.file, item.presigned, {
							onUploadProgress,
							onSinglePartUploadedFromClient,
							onUploadComplete: onUploadCompleteCallback,
						});
					} else {
						await uploadMultipart(item.file, item.presigned, {
							onUploadProgress,
							onAllPartsUploadedFromClient: onAllPartsUploaded,
							onUploadComplete: onUploadCompleteCallback,
						});
					}
				}),
			);
		}
	}, [uploadQueue, setUploadQueue, onUploadProgress, onAllPartsUploaded]);

	const removeFromUploadQueue = useCallback(
		(file: File) => {
			setUploadQueue(prev => prev.filter(q => q.file !== file));
		},
		[setUploadQueue],
	);

	const clearUploadQueue = useCallback(() => {
		setUploadQueue([]);
	}, [setUploadQueue]);

	return {
		acceptedFiles,
		uploadQueue,
		setUploadQueue,
		removeFromUploadQueue,
		clearUploadQueue,
		isPendingPresigns: presignedIsPending,
		uploading,
		handleSubmit,
		...useDropzoneReturn,
	};
}

export type UseUploadReturn = ReturnType<typeof useUpload>;
