'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { UploadTab } from '@barely/validators';
import React, { useState } from 'react';
import { useUpload, useWorkspace } from '@barely/hooks';
import { uploadTabSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { atom } from 'jotai';
import { Image, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Img } from '@barely/ui/img';
import { Input } from '@barely/ui/input';
import { SelectableMedia } from '@barely/ui/selectable-media';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Textarea } from '@barely/ui/textarea';
import { Text } from '@barely/ui/typography';
import { UploadDropzone } from '@barely/ui/upload';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

const imageUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function BioImagePage({ blockId }: { blockId: string }) {
	const { handle } = useWorkspace();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('image');
	const [blockName, setBlockName] = useState('');
	const [editTitle, setEditTitle] = useState('');
	const [editSubtitle, setEditSubtitle] = useState('');
	const [imageCaption, setImageCaption] = useState('');
	const [imageAltText, setImageAltText] = useState('');
	const [uploadTab, setUploadTab] = useState<UploadTab>('upload');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showReplaceImage, setShowReplaceImage] = useState(false);
	const { bioKey } = useBioQueryState();

	const bioQueryKey = trpc.bio.byKey.queryOptions({
		handle,
		key: bioKey,
	}).queryKey;

	const blocksQueryKey = trpc.bio.blocksByHandleAndKey.queryOptions({
		handle,
		key: bioKey,
	}).queryKey;

	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions(
			{
				handle,
				key: bioKey,
			},
			{ staleTime: 1000 * 60 * 5 },
		),
	);

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions(
			{ handle, key: bioKey },
			{ staleTime: 1000 * 60 * 5 },
		),
	);

	const block = blocks.find(b => b.id === blockId);

	// Initialize form values when block loads
	React.useEffect(() => {
		if (block) {
			setEditTitle(block.title ?? '');
			setEditSubtitle(block.subtitle ?? '');
			setBlockName(block.name ?? 'Image Block');
			setImageCaption(block.imageCaption ?? '');
			setImageAltText(block.imageAltText ?? '');

			// Debug log to see what's in the block
			console.log('Block data:', {
				id: block.id,
				imageFileId: block.imageFileId,
				imageFile: block.imageFile,
			});
		}
	}, [block]);

	// Get current image file details
	const currentImage = block?.imageFile;
	// Check if we have all required image properties
	const hasValidImage = !!currentImage?.s3Key;

	// Upload hook
	const imageUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: imageUploadQueueAtom,
		maxFiles: 1,
		onUploadComplete: fileRecord => {
			console.log('Image upload complete, saving with fileId:', fileRecord.id);

			// Auto-save the image after upload completes
			setIsSubmitting(true);
			updateBlock(
				{
					handle,
					id: blockId,
					imageFileId: fileRecord.id,
				},
				{
					onSuccess: () => {
						console.log('Image saved successfully');
						toast.success('Image uploaded successfully');
						// Clear the upload queue after successful save
						setImageUploadQueue([]);
						// Reset replace image view if we were replacing
						setShowReplaceImage(false);
					},
					onError: error => {
						console.error('Failed to save image:', error);
					},
				},
			);
		},
	});

	const {
		isPendingPresigns: isPendingPresignsImage,
		uploadQueue: imageUploadQueue,
		uploading: uploadingImage,
		setUploadQueue: setImageUploadQueue,
		handleSubmit: handleImageUpload,
	} = imageUploadState;

	const uploadPreviewImage = imageUploadQueue[0]?.previewImage;
	const uploadProgress = imageUploadQueue[0]?.progress ?? 0;

	// Auto-trigger upload when files are ready
	React.useEffect(() => {
		if (imageUploadQueue.length > 0 && imageUploadQueue[0]?.status === 'readyToUpload') {
			console.log('Files ready to upload, triggering upload...');
			void handleImageUpload();
		}
	}, [imageUploadQueue, handleImageUpload]);

	// Mutations
	const { mutate: updateBlock } = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onError: () => {
				toast.error('Failed to update block');
			},
			onSuccess: (data, variables) => {
				// Only show success toast for non-image updates
				// Image updates have their own success messaging
				if (!variables.imageFileId) {
					toast.success('Block updated');
				}
			},
			onSettled: async () => {
				// Invalidate both queries to ensure fresh data
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: blocksQueryKey }),
					queryClient.invalidateQueries({ queryKey: bioQueryKey }),
				]);
				setIsSubmitting(false);
			},
		}),
	);

	const { mutate: deleteBlock } = useMutation(
		trpc.bio.deleteBlock.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	// Handle media library selection
	const handleMediaSelect = (file: {
		id: string;
		name: string;
		s3Key: string;
		width?: number | null;
		height?: number | null;
		blurDataUrl?: string | null;
	}) => {
		// Clear the upload queue
		setImageUploadQueue([]);

		// Auto-save immediately
		setIsSubmitting(true);
		updateBlock(
			{
				handle,
				id: blockId,
				imageFileId: file.id,
			},
			{
				onSuccess: () => {
					toast.success('Image selected successfully');
					// Reset replace image view if we were replacing
					setShowReplaceImage(false);
				},
			},
		);
	};

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this image block?')) {
			deleteBlock({
				handle,
				bioId: bio.id,
				blockId,
			});
		}
	};

	const handleRemoveImage = () => {
		if (confirm('Are you sure you want to remove this image?')) {
			updateBlock({
				handle,
				id: blockId,
				imageFileId: null,
			});
			setShowReplaceImage(false);
		}
	};

	const handleSaveAllDetails = () => {
		if (!block) return;
		updateBlock({
			handle,
			id: blockId,
			title: editTitle || null,
			subtitle: editSubtitle || null,
			imageCaption: imageCaption || null,
			imageAltText: imageAltText || null,
		});
	};

	const isProcessing = isPendingPresignsImage || uploadingImage || isSubmitting;
	const hasImage = hasValidImage;

	// Handle missing block case
	if (!block) {
		return (
			<div className='flex items-center justify-center p-8'>
				<Text variant='sm/normal' className='text-gray-500'>
					Block not found
				</Text>
			</div>
		);
	}

	return (
		<Card className='p-6'>
			{/* Back link */}
			<div className='mb-4'>
				<Button
					href={`/${handle}/bios/blocks?bioKey=${bio.key}&scrollToBlock=${blockId}`}
					variant='button'
					look='ghost'
					size='sm'
					startIcon='arrowLeft'
					className='text-gray-600 hover:text-gray-800'
				>
					Back
				</Button>
			</div>

			{/* Header */}
			<div className='mb-6 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100'>
						<Image className='h-5 w-5 text-purple-600' />
					</div>
					<div className='flex-1'>
						<Input
							value={blockName}
							onChange={e => setBlockName(e.target.value)}
							onBlur={() => {
								if (blockName !== block.name) {
									updateBlock({ handle, id: blockId, name: blockName });
								}
							}}
							variant='contentEditable'
							className='text-lg font-semibold'
							placeholder='Image Block'
						/>
						<Text variant='sm/normal' className='text-gray-500'>
							{hasImage ? 'Image uploaded' : 'No image yet'}
						</Text>
					</div>
				</div>

				{/* Top right controls */}
				<div className='flex items-center gap-2'>
					<Switch
						checked={block.enabled}
						onCheckedChange={checked =>
							updateBlock({ handle, id: blockId, enabled: checked })
						}
					/>
					<Button variant='icon' look='ghost' size='sm' onClick={handleDeleteBlock}>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='image'>
						<Image className='mr-2 h-4 w-4' />
						Image
					</TabsTrigger>
					<TabsTrigger value='details'>
						<Settings className='mr-2 h-4 w-4' />
						Details
					</TabsTrigger>
				</TabsList>

				{/* Image Tab */}
				<TabsContent value='image' className='space-y-4'>
					<div className='space-y-6'>
						{/* Image Preview - Show when image exists and not replacing */}
						{hasImage && !showReplaceImage && (
							<div className='space-y-4'>
								{/* Image Display */}
								<div className='relative overflow-hidden rounded-lg bg-gray-50'>
									<div className='flex h-[400px] items-center justify-center'>
										<Img
											s3Key={currentImage.s3Key}
											blurDataURL={currentImage.blurDataUrl ?? undefined}
											alt={imageAltText || blockName}
											width={currentImage.width ?? 800}
											height={currentImage.height ?? 400}
											className='h-full w-auto object-contain'
											priority
										/>
									</div>
								</div>

								{/* Action Buttons */}
								<div className='flex gap-2'>
									<Button
										onClick={() => setShowReplaceImage(true)}
										size='md'
										look='primary'
										startIcon='refresh'
									>
										Replace Image
									</Button>
									<Button
										onClick={handleRemoveImage}
										size='md'
										look='destructive'
										startIcon='trash'
									>
										Remove Image
									</Button>
								</div>
							</div>
						)}

						{/* Upload Section - Show when no image OR when replacing */}
						{(!hasImage || showReplaceImage) && (
							<div>
								{/* Back button if replacing */}
								{hasImage && showReplaceImage && (
									<Button
										look='ghost'
										size='sm'
										onClick={() => setShowReplaceImage(false)}
										startIcon='arrowLeft'
										className='mb-4'
									>
										Back to current image
									</Button>
								)}

								<Tabs
									value={uploadTab}
									onValueChange={value => setUploadTab(uploadTabSchema.parse(value))}
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
										<UploadDropzone
											{...imageUploadState}
											title={
												hasImage && showReplaceImage ?
													'Drop a new image here to replace'
												:	'Drop image here or click to browse'
											}
											imagePreviewSrc={uploadPreviewImage}
											existingImageS3Key={undefined}
											className='min-h-[400px] w-full'
										/>
										{isProcessing && (
											<div className='mt-4 space-y-2 rounded-lg bg-blue-50 p-3'>
												<p className='text-center text-sm font-medium text-blue-700'>
													{uploadingImage ?
														`Uploading to storage... ${uploadProgress}%`
													:	'Processing image...'}
												</p>
												{uploadingImage && uploadProgress > 0 && (
													<div className='h-2 w-full overflow-hidden rounded-full bg-blue-200'>
														<div
															className='h-full bg-blue-600 transition-all duration-300'
															style={{ width: `${uploadProgress}%` }}
														/>
													</div>
												)}
											</div>
										)}
									</TabsContent>

									<TabsContent value='library' className='mt-6'>
										<div className='min-h-[400px]'>
											<SelectableMedia
												selectionMode='single'
												unavailableFiles={[]}
												onSelect={handleMediaSelect}
											/>
										</div>
										<div className='mt-4 rounded-lg bg-gray-50 p-3 text-center'>
											<p className='text-sm text-gray-600'>
												Click an image to select and save automatically
											</p>
										</div>
									</TabsContent>
								</Tabs>
							</div>
						)}

						{/* Loading State */}
						{isProcessing && (
							<div className='flex items-center justify-center p-8'>
								<div className='flex flex-col items-center gap-3'>
									<div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600' />
									<span className='text-sm font-medium text-gray-600'>
										{uploadingImage ? 'Uploading image...' : 'Saving changes...'}
									</span>
								</div>
							</div>
						)}
					</div>
				</TabsContent>

				{/* Details Tab */}
				<TabsContent value='details' className='space-y-4'>
					<div className='space-y-6'>
						{/* Block Title and Subtitle */}
						<div>
							<Text variant='lg/semibold' className='mb-2'>
								Block Display
							</Text>
							<Text variant='sm/normal' className='mb-4 text-gray-500'>
								Add title and subtitle to provide context for your image.
							</Text>
							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm font-medium'>
										Title (optional)
									</label>
									<Input
										value={editTitle}
										onChange={e => setEditTitle(e.target.value)}
										placeholder='Enter a title for this block'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm font-medium'>
										Subtitle (optional)
									</label>
									<Input
										value={editSubtitle}
										onChange={e => setEditSubtitle(e.target.value)}
										placeholder='Enter a subtitle'
									/>
								</div>
							</div>
						</div>

						{/* Image Details */}
						<div>
							<Text variant='lg/semibold' className='mb-2'>
								Image Information
							</Text>
							<Text variant='sm/normal' className='mb-4 text-gray-500'>
								Provide caption and alt text for accessibility and SEO.
							</Text>
							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm font-medium'>
										Caption (optional)
									</label>
									<Input
										value={imageCaption}
										onChange={e => setImageCaption(e.target.value)}
										placeholder='Add a caption for this image'
										maxLength={200}
									/>
									<Text variant='xs/normal' className='mt-1 text-gray-500'>
										{imageCaption.length} / 200 characters
									</Text>
								</div>

								<div>
									<label className='mb-2 block text-sm font-medium'>
										Alt Text (for accessibility)
									</label>
									<Textarea
										value={imageAltText}
										onChange={e => setImageAltText(e.target.value)}
										placeholder='Describe this image for screen readers'
										rows={2}
										maxLength={255}
									/>
									<Text variant='xs/normal' className='mt-1 text-gray-500'>
										{imageAltText.length} / 255 characters - Important for SEO and
										accessibility
									</Text>
								</div>
							</div>
						</div>

						{/* Save Button */}
						<div className='flex justify-end pt-4'>
							<Button onClick={handleSaveAllDetails} size='lg' look='primary'>
								Save All Details
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</Card>
	);
}
