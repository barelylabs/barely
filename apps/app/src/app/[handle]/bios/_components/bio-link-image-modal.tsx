'use client';

import type { UploadQueueItem } from '@barely/hooks';
import { useState } from 'react';
import { useUpload } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atom } from 'jotai';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogRoot,
	AlertDialogTitle,
} from '@barely/ui/alert-dialog';
import { Button } from '@barely/ui/button';
import { Img } from '@barely/ui/img';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { SelectableMedia } from '@barely/ui/selectable-media';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { UploadDropzone } from '@barely/ui/upload';

const imageUploadQueueAtom = atom<UploadQueueItem[]>([]);

interface BioLinkImageModalProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	linkId: string;
	currentImage?: {
		id: string;
		s3Key: string;
		blurDataUrl: string | null;
		name: string;
		width: number | null;
		height: number | null;
	} | null;
	handle: string;
	blockId: string;
	bioKey: string;
}

export function BioLinkImageModal({
	showModal,
	setShowModal,
	linkId,
	currentImage,
	handle,
	bioKey,
}: BioLinkImageModalProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
	const [activeTab, setActiveTab] = useState<'upload' | 'library' | null>(
		currentImage ? null : 'upload',
	);
	const [currentFile, setCurrentFile] = useState(
		currentImage ?
			{
				id: currentImage.id,
				name: currentImage.name,
				s3Key: currentImage.s3Key,
				width: currentImage.width ?? undefined,
				height: currentImage.height ?? undefined,
				blurDataUrl: currentImage.blurDataUrl,
			}
		:	null,
	);

	const imageUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: imageUploadQueueAtom,
		maxFiles: 1,
		onPresigned: presigned => {
			const presignedFile = presigned[0];
			if (!presignedFile) {
				throw new Error('No presigned file found');
			}

			// Set the file in state
			setCurrentFile({
				id: presignedFile.fileRecord.id,
				name: presignedFile.fileRecord.name,
				s3Key: presignedFile.fileRecord.s3Key,
				width: presignedFile.fileRecord.width ?? undefined,
				height: presignedFile.fileRecord.height ?? undefined,
				blurDataUrl: null,
			});

			// Auto-save the image immediately after upload
			setIsSubmitting(true);
			updateLinkImage({
				handle,
				linkId,
				fileId: presignedFile.fileRecord.id,
			});
		},
	});

	const {
		isPendingPresigns: isPendingPresignsImage,
		uploadQueue: imageUploadQueue,
		uploading: uploadingImage,
		setUploadQueue: setImageUploadQueue,
	} = imageUploadState;

	const uploadPreviewImage = imageUploadQueue[0]?.previewImage;

	const { mutate: updateLinkImage } = useMutation(
		trpc.bio.updateLinkImage.mutationOptions({
			onSuccess: () => {
				toast.success('Image updated successfully');

				// Auto-close modal after a short delay to show success
				setTimeout(() => {
					handleCloseModal();
				}, 800);
			},
			onError: error => {
				toast.error(error.message);
				setIsSubmitting(false);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: [
						['bio', 'blocksByHandleAndKey'],
						{ input: { handle, key: bioKey }, type: 'query' },
					],
				});
			},
		}),
	);

	const { mutate: removeLinkImage } = useMutation(
		trpc.bio.removeLinkImage.mutationOptions({
			onSuccess: () => {
				toast.success('Image removed successfully');
				setCurrentFile(null);
				setActiveTab('upload');

				// Auto-close modal after a short delay
				setTimeout(() => {
					handleCloseModal();
				}, 800);
			},
			onError: error => {
				toast.error(error.message);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: [
						['bio', 'blocksByHandleAndKey'],
						{ input: { handle, key: bioKey }, type: 'query' },
					],
				});
				setIsSubmitting(false);
			},
		}),
	);

	// Auto-save when selecting from media library
	const handleMediaSelect = (file: {
		id: string;
		name: string;
		s3Key: string;
		width?: number | null;
		height?: number | null;
		blurDataUrl?: string | null;
	}) => {
		setCurrentFile({
			id: file.id,
			name: file.name,
			s3Key: file.s3Key,
			width: file.width ?? undefined,
			height: file.height ?? undefined,
			blurDataUrl: file.blurDataUrl ?? null,
		});

		// Clear the upload queue
		setImageUploadQueue([]);

		// Auto-save immediately
		setIsSubmitting(true);
		updateLinkImage({
			handle,
			linkId,
			fileId: file.id,
		});
	};

	const handleRemoveImage = () => {
		setShowRemoveConfirm(true);
	};

	const confirmRemoveImage = () => {
		removeLinkImage({ handle, linkId });
		setShowRemoveConfirm(false);
	};

	const handleCloseModal = () => {
		setImageUploadQueue([]);
		setShowModal(false);
		setIsSubmitting(false);
		setActiveTab(currentImage ? null : 'upload');
	};

	const isProcessing = isPendingPresignsImage || uploadingImage || isSubmitting;
	const preventDefaultClose = isProcessing;
	const currentS3Key = currentFile?.s3Key;
	const hasCurrentImage = !!currentS3Key && !uploadPreviewImage;

	return (
		<>
			<Modal
				showModal={showModal}
				setShowModal={setShowModal}
				preventDefaultClose={preventDefaultClose}
				onClose={handleCloseModal}
				className='max-w-2xl'
			>
				<ModalHeader
					// icon='image'
					title='Image Preview'
					justify='left'
					// subtitle='Replace or delete the current image'
				/>
				<ModalBody className='relative'>
					<div className='flex flex-col gap-6'>
						{/* Image Preview - Simply render if s3Key exists */}
						{currentS3Key && (
							<div
								className={cn(
									'relative flex justify-center overflow-hidden rounded-lg bg-gray-50',
									activeTab && 'hidden',
								)}
							>
								<div className='relative h-[360px]'>
									<Img
										s3Key={currentS3Key}
										blurDataURL={currentFile.blurDataUrl ?? undefined}
										alt=''
										width={currentFile.width ?? 640}
										height={currentFile.height ?? 360}
										className={cn('h-full w-auto object-contain', activeTab && 'hidden')}
										priority
									/>
								</div>
								{isProcessing && (
									<div className='absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
										<div className='flex flex-col items-center gap-3'>
											<div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600' />
											<span className='text-sm font-medium text-gray-600'>
												Updating...
											</span>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Current Image Section controls */}
						{hasCurrentImage && !activeTab && (
							<div className='space-y-6'>
								{/* Action Buttons - Full width at bottom */}
								<div className='flex w-full flex-row gap-4'>
									<div className='flex-1'>
										<Button
											type='button'
											variant='button'
											look='destructive'
											size='lg'
											onClick={handleRemoveImage}
											startIcon='trash'
											className='flex-1'
										>
											Delete
										</Button>
									</div>
									<div className='flex-1'>
										<Button
											type='button'
											variant='button'
											look='primary'
											size='lg'
											onClick={() => setActiveTab('upload')}
											startIcon='plus'
											className='flex-1'
										>
											Replace
										</Button>
									</div>
								</div>
							</div>
						)}

						{/* Upload/Library Section - Show when no image or replacing */}
						{(!hasCurrentImage || activeTab !== null) && (
							<div className='space-y-5'>
								{/* Back button if replacing */}
								{hasCurrentImage && activeTab && (
									<Button
										look='ghost'
										size='sm'
										onClick={() => setActiveTab(null)}
										startIcon='arrowLeft'
										className='mb-2'
									>
										Back to current image
									</Button>
								)}

								<Tabs
									value={activeTab ?? 'upload'}
									onValueChange={value => setActiveTab(value as 'upload' | 'library')}
									className='w-full'
								>
									<TabsList className='grid w-full grid-cols-2'>
										<TabsTrigger value='upload' disabled={isProcessing}>
											Upload New
										</TabsTrigger>
										<TabsTrigger value='library' disabled={isProcessing}>
											Media Library
										</TabsTrigger>
									</TabsList>

									<TabsContent value='upload' className='mt-6'>
										<div className='space-y-4'>
											<UploadDropzone
												{...imageUploadState}
												title={
													hasCurrentImage ?
														'Drop a new image here to replace'
													:	'Drop image here or click to browse'
												}
												imagePreviewSrc={uploadPreviewImage}
												existingImageS3Key={undefined}
												className='min-h-[300px] w-full'
											/>
											{uploadPreviewImage && !isProcessing && (
												<div className='rounded-lg bg-green-50 p-3 text-center'>
													<p className='text-sm font-medium text-green-700'>
														Image will be saved automatically
													</p>
												</div>
											)}
										</div>
									</TabsContent>

									<TabsContent value='library' className='mt-6'>
										<div className='space-y-4'>
											<div className='min-h-[300px]'>
												<SelectableMedia
													selectionMode='single'
													unavailableFiles={[]}
													onSelect={handleMediaSelect}
												/>
											</div>
											<div className='rounded-lg bg-gray-50 p-3 text-center'>
												<p className='text-sm text-gray-600'>
													Click an image to select and save automatically
												</p>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</div>
						)}

						{/* Loading State - More subtle overlay */}
						{isProcessing && !hasCurrentImage && (
							<div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm'>
								<div className='flex flex-col items-center gap-3'>
									<div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600' />
									<span className='text-sm font-medium text-gray-600'>
										{uploadingImage ? 'Uploading image...' : 'Saving changes...'}
									</span>
								</div>
							</div>
						)}
					</div>
				</ModalBody>
			</Modal>

			{/* Remove Confirmation Dialog */}
			<AlertDialogRoot open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
				<AlertDialogContent className='z-[100]'>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Image</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this image? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmRemoveImage} look='destructive'>
							Remove Image
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogRoot>
		</>
	);
}
