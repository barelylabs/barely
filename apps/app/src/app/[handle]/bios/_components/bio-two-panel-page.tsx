'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import type { UpdateBioBlock } from '@barely/validators';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useUpload, useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
import { uploadTabSchema } from '@barely/validators';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { atom } from 'jotai';
import { debounce } from 'lodash';
import { Check, Columns, Image, Laptop, Smartphone, Trash2 } from 'lucide-react';
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@barely/ui/command';
import { Img } from '@barely/ui/img';
import { Input } from '@barely/ui/input';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { SelectableMedia } from '@barely/ui/selectable-media';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';
import { UploadDropzone } from '@barely/ui/upload';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

type BioBlock = AppRouterOutputs['bio']['blocksByHandleAndKey'][number];

const imageUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function BioTwoPanelPage({ blockId }: { blockId: string }) {
	return (
		<NavigationGuardProvider>
			<BioTwoPanelPageInner blockId={blockId} />
		</NavigationGuardProvider>
	);
}

function BioTwoPanelPageInner({ blockId }: { blockId: string }) {
	const { handle } = useWorkspace();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const editorRef = useRef<MDXEditorMethods>(null);

	// Tab state
	const [activeTab, setActiveTab] = useState('image');

	// Block metadata
	const [blockName, setBlockName] = useState('');

	// Content fields
	const [editTitle, setEditTitle] = useState('');
	const [editSubtitle, setEditSubtitle] = useState('');
	const [markdown, setMarkdown] = useState('');
	const [originalMarkdown, setOriginalMarkdown] = useState('');
	const [originalTitle, setOriginalTitle] = useState('');
	const [originalSubtitle, setOriginalSubtitle] = useState('');

	// CTA fields
	const [ctaText, setCtaText] = useState('');
	const [originalCtaText, setOriginalCtaText] = useState('');
	const [ctaType, setCtaType] = useState<'none' | 'url' | 'bio' | 'cart'>('none');
	const [ctaUrl, setCtaUrl] = useState('');
	const [ctaBioId, setCtaBioId] = useState<string | null>(null);
	const [ctaCartFunnelId, setCtaCartFunnelId] = useState<string | null>(null);
	const [showFunnelSelector, setShowFunnelSelector] = useState(false);
	const [showBioSelector, setShowBioSelector] = useState(false);

	// Layout settings
	const [imageDesktopSide, setImageDesktopSide] = useState<'left' | 'right'>('left');
	const [imageMobileSide, setImageMobileSide] = useState<'top' | 'bottom'>('top');
	const [originalImageDesktopSide, setOriginalImageDesktopSide] = useState<
		'left' | 'right'
	>('left');
	const [originalImageMobileSide, setOriginalImageMobileSide] = useState<
		'top' | 'bottom'
	>('top');

	// Image upload state
	const [uploadTab, setUploadTab] = useState<'upload' | 'library'>('upload');
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

	// Fetch cart funnels for CTA selector
	const { data: cartFunnels, isLoading: isLoadingFunnels } = useQuery(
		trpc.cartFunnel.byWorkspace.queryOptions({
			handle,
			search: '',
			showArchived: false,
			showDeleted: false,
		}),
	);

	// Fetch bio pages for CTA selector
	const { data: bios } = useQuery(
		trpc.bio.byWorkspace.queryOptions({
			handle,
			search: '',
		}),
	);

	// Initialize form values when block loads
	const formSetRef = useRef(false);
	React.useEffect(() => {
		if (formSetRef.current) return;
		if (block) {
			setEditTitle(block.title ?? '');
			setEditSubtitle(block.subtitle ?? '');
			setBlockName(block.name ?? 'Two Panel Block');
			setMarkdown(block.markdown ?? '');
			setOriginalMarkdown(block.markdown ?? '');
			setOriginalTitle(block.title ?? '');
			setOriginalSubtitle(block.subtitle ?? '');
			setCtaText(block.ctaText ?? '');
			setOriginalCtaText(block.ctaText ?? '');
			setImageDesktopSide(block.imageDesktopSide ?? 'left');
			setImageMobileSide(block.imageMobileSide ?? 'top');
			setOriginalImageDesktopSide(block.imageDesktopSide ?? 'left');
			setOriginalImageMobileSide(block.imageMobileSide ?? 'top');

			// Set CTA type and value based on what's populated
			if (block.targetUrl) {
				setCtaType('url');
				setCtaUrl(block.targetUrl);
			} else if (block.targetBioId) {
				setCtaType('bio');
				setCtaBioId(block.targetBioId);
			} else if (block.targetCartFunnelId) {
				setCtaType('cart');
				setCtaCartFunnelId(block.targetCartFunnelId);
			} else {
				setCtaType('none');
			}

			formSetRef.current = true;
		}
	}, [block]);

	// Get current image file details
	const currentImage = block?.imageFile;
	const hasImage = !!currentImage?.s3Key;

	// Upload hook
	const imageUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: imageUploadQueueAtom,
		maxFiles: 1,
		onUploadComplete: fileRecord => {
			// Auto-save the image immediately after upload
			setIsSubmitting(true);
			updateBlock(
				{
					handle,
					id: blockId,
					imageFileId: fileRecord.id,
				},
				{
					onSuccess: () => {
						toast.success('Image uploaded successfully');
						setImageUploadQueue([]);
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
			void handleImageUpload();
		}
	}, [imageUploadQueue, handleImageUpload]);

	// Mutations
	const { mutate: updateBlock } = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });
				const previousBlocks = queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
				if (!previousBlocks) return;

				const updatedBlocks = previousBlocks.map(block => {
					if (block.id !== blockId) return block;
					return {
						...block,
						...data,
					};
				});

				queryClient.setQueryData(blocksQueryKey, updatedBlocks);
				return { previousBlocks };
			},
			onError: (_error, _variables, context) => {
				queryClient.setQueryData(blocksQueryKey, context?.previousBlocks);
				toast.error('Failed to update block');
			},
			onSuccess: (_data, variables) => {
				// Update original values after successful save
				if ('markdown' in variables) {
					setOriginalMarkdown(variables.markdown ?? '');
				}
				if ('title' in variables) {
					setOriginalTitle(variables.title ?? '');
				}
				if ('subtitle' in variables) {
					setOriginalSubtitle(variables.subtitle ?? '');
				}
				if ('ctaText' in variables) {
					setOriginalCtaText(variables.ctaText ?? '');
				}
				if ('imageDesktopSide' in variables) {
					setOriginalImageDesktopSide(variables.imageDesktopSide ?? 'left');
				}
				if ('imageMobileSide' in variables) {
					setOriginalImageMobileSide(variables.imageMobileSide ?? 'top');
				}
				// Only show toast for non-image and non-layout updates
				if (
					!variables.imageFileId &&
					!('imageDesktopSide' in variables || 'imageMobileSide' in variables)
				) {
					toast.success('Block updated');
				}
			},
			onSettled: async () => {
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

	// Handle markdown change with optimistic update
	const handleMarkdownChange = useCallback(
		(newMarkdown: string) => {
			setMarkdown(newMarkdown);
			// Optimistically update the query cache
			queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
				if (!oldBlocks) return oldBlocks;
				return oldBlocks.map(b => {
					if (b.id !== blockId) return b;
					return {
						...b,
						markdown: newMarkdown,
					};
				});
			});
		},
		[queryClient, blocksQueryKey, blockId],
	);

	// Track if content has changed
	const hasUnsavedChanges =
		markdown !== originalMarkdown ||
		editTitle !== originalTitle ||
		editSubtitle !== originalSubtitle ||
		ctaText !== originalCtaText;

	// Set up navigation guard for unsaved changes
	useNavigationGuard({
		enabled: hasUnsavedChanges,
		confirm: () => {
			return window.confirm('You have unsaved changes. Are you sure you want to leave?');
		},
	});

	// Handle media library selection
	const handleMediaSelect = (file: {
		id: string;
		name: string;
		s3Key: string;
		width?: number | null;
		height?: number | null;
		blurDataUrl?: string | null;
	}) => {
		setImageUploadQueue([]);
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
					setShowReplaceImage(false);
				},
			},
		);
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

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this two-panel block?')) {
			deleteBlock({
				handle,
				bioId: bio.id,
				blockId,
			});
		}
	};

	const handleSaveContent = () => {
		if (!block) return;

		// Build update data
		const updateData: UpdateBioBlock & { handle: string } = {
			handle,
			id: blockId,
			title: editTitle || null,
			subtitle: editSubtitle || null,
			markdown: markdown || null,
			ctaText: ctaText || null,
			// Clear all CTA fields first
			targetUrl: null,
			targetBioId: null,
			targetCartFunnelId: null,
		};

		// Set the appropriate CTA field based on selection
		if (ctaText && ctaType !== 'none') {
			switch (ctaType) {
				case 'url':
					updateData.targetUrl = ctaUrl || null;
					break;
				case 'bio':
					updateData.targetBioId = ctaBioId;
					break;
				case 'cart':
					updateData.targetCartFunnelId = ctaCartFunnelId;
					break;
			}
		}

		updateBlock(updateData);
	};

	const handleCancelChanges = () => {
		setMarkdown(originalMarkdown);
		setEditTitle(originalTitle);
		setEditSubtitle(originalSubtitle);
		setCtaText(originalCtaText);
		if (editorRef.current) {
			editorRef.current.setMarkdown(originalMarkdown);
		}

		// Revert the optimistic updates
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return {
					...b,
					markdown: originalMarkdown,
					title: originalTitle,
					subtitle: originalSubtitle,
					ctaText: originalCtaText,
				};
			});
		});
	};

	// Debounced layout update function
	const debouncedLayoutUpdate = useMemo(
		() =>
			debounce((desktopSide: 'left' | 'right', mobileSide: 'top' | 'bottom') => {
				updateBlock({
					handle,
					id: blockId,
					imageDesktopSide: desktopSide,
					imageMobileSide: mobileSide,
				});
			}, 2000),
		[handle, blockId, updateBlock],
	);

	// Handle desktop layout change with optimistic update
	const handleDesktopLayoutChange = (side: 'left' | 'right') => {
		setImageDesktopSide(side);
		// Optimistically update cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return { ...b, imageDesktopSide: side };
			});
		});
		// Trigger debounced save
		debouncedLayoutUpdate(side, imageMobileSide);
	};

	// Handle mobile layout change with optimistic update
	const handleMobileLayoutChange = (side: 'top' | 'bottom') => {
		setImageMobileSide(side);
		// Optimistically update cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return { ...b, imageMobileSide: side };
			});
		});
		// Trigger debounced save
		debouncedLayoutUpdate(imageDesktopSide, side);
	};

	// Optimistic update handlers for text fields
	const handleTitleChange = (newTitle: string) => {
		setEditTitle(newTitle);
		// Optimistically update cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return { ...b, title: newTitle || null };
			});
		});
	};

	const handleSubtitleChange = (newSubtitle: string) => {
		setEditSubtitle(newSubtitle);
		// Optimistically update cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return { ...b, subtitle: newSubtitle || null };
			});
		});
	};

	const handleCtaTextChange = (newCtaText: string) => {
		setCtaText(newCtaText);
		// Optimistically update cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return { ...b, ctaText: newCtaText || null };
			});
		});
	};

	const isProcessing = isPendingPresignsImage || uploadingImage || isSubmitting;

	// Character count for markdown
	const characterCount = markdown.length;
	const maxCharacters = 5000;
	const isOverLimit = characterCount > maxCharacters;

	// Track unsaved changes
	// const hasUnsavedChanges =
	// 	markdown !== originalMarkdown ||
	// 	editTitle !== originalTitle ||
	// 	editSubtitle !== originalSubtitle ||
	// 	ctaText !== originalCtaText;

	// Handle tab change with unsaved changes warning
	const handleTabChange = (newTab: string) => {
		if (hasUnsavedChanges && activeTab === 'content') {
			const confirmMessage =
				'You have unsaved changes. Do you want to save them before switching tabs?';
			const result = window.confirm(confirmMessage);
			if (result) {
				// Save changes before switching
				handleSaveContent();
			}
		}
		setActiveTab(newTab);
	};

	// Validation
	const isCtaIncomplete =
		ctaText &&
		ctaType !== 'none' &&
		((ctaType === 'url' && !ctaUrl) ||
			(ctaType === 'bio' && !ctaBioId) ||
			(ctaType === 'cart' && !ctaCartFunnelId));

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

	// Get selected items for display
	const selectedFunnel = cartFunnels?.cartFunnels.find(
		(f: { id: string }) => f.id === ctaCartFunnelId,
	);
	const selectedBio = bios?.bios.find(b => b.id === ctaBioId);

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
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100'>
						<Columns className='h-5 w-5 text-indigo-600' />
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
							placeholder='Two Panel Block'
						/>
						<Text variant='sm/normal' className='text-gray-500'>
							{hasImage ? 'Image + Content' : 'Missing image'}
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
			<Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='image'>
						<Image className='mr-2 h-4 w-4' />
						Image
					</TabsTrigger>
					<TabsTrigger value='content'>
						<Columns className='mr-2 h-4 w-4' />
						Content
					</TabsTrigger>
					<TabsTrigger value='layout'>
						<Laptop className='mr-2 h-4 w-4' />
						Layout
					</TabsTrigger>
				</TabsList>

				{/* Image Tab */}
				<TabsContent value='image' className='space-y-4'>
					<div className='space-y-6'>
						{/* Image Preview - Show when image exists and not replacing */}
						{hasImage && !showReplaceImage && (
							<div className='space-y-4'>
								<div className='relative overflow-hidden rounded-lg bg-gray-50'>
									<div className='flex h-[400px] items-center justify-center'>
										<Img
											s3Key={currentImage.s3Key}
											blurDataURL={currentImage.blurDataUrl ?? undefined}
											alt={editTitle || blockName}
											width={currentImage.width ?? 800}
											height={currentImage.height ?? 400}
											className='h-full w-auto object-contain'
											priority
										/>
									</div>
								</div>
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

								<div className='rounded-lg border border-gray-200 bg-gray-50/50 p-4'>
									<Tabs
										value={uploadTab}
										onValueChange={value => setUploadTab(uploadTabSchema.parse(value))}
										className='w-full'
									>
										<TabsList className='grid w-full grid-cols-2 bg-muted/70'>
											<TabsTrigger value='upload' disabled={isProcessing}>
												Upload New
											</TabsTrigger>
											<TabsTrigger value='library' disabled={isProcessing}>
												Media Library
											</TabsTrigger>
										</TabsList>

										<TabsContent value='upload' className='mt-4'>
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
											{uploadPreviewImage && isProcessing && (
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

										<TabsContent value='library' className='mt-4'>
											<div className='min-h-[400px]'>
												<SelectableMedia
													selectionMode='single'
													unavailableFiles={[]}
													onSelect={handleMediaSelect}
												/>
											</div>
											<div className='mt-4 rounded-lg bg-white p-3 text-center'>
												<p className='text-sm text-gray-600'>
													Click an image to select and save automatically
												</p>
											</div>
										</TabsContent>
									</Tabs>
								</div>
							</div>
						)}
					</div>
				</TabsContent>

				{/* Content Tab */}
				<TabsContent value='content' className='space-y-6'>
					{/* Title and Subtitle */}
					<div className='space-y-4'>
						<div>
							<label className='mb-2 block text-sm font-medium'>Title (optional)</label>
							<Input
								value={editTitle}
								onChange={e => handleTitleChange(e.target.value)}
								onBlur={() => {
									if (editTitle !== originalTitle) {
										updateBlock({
											handle,
											id: blockId,
											title: editTitle || null,
										});
									}
								}}
								placeholder='Enter block title'
							/>
						</div>

						<div>
							<label className='mb-2 block text-sm font-medium'>
								Subtitle (optional)
							</label>
							<Input
								value={editSubtitle}
								onChange={e => handleSubtitleChange(e.target.value)}
								onBlur={() => {
									if (editSubtitle !== originalSubtitle) {
										updateBlock({
											handle,
											id: blockId,
											subtitle: editSubtitle || null,
										});
									}
								}}
								placeholder='Enter block subtitle'
							/>
						</div>
					</div>

					{/* Markdown Content */}
					<div>
						<div className='mb-2 flex items-center justify-between'>
							<label className='block text-sm font-medium'>Content</label>
							<Text
								variant='sm/normal'
								className={cn('text-gray-500', isOverLimit && 'text-red-500')}
							>
								{characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}{' '}
								characters
							</Text>
						</div>
						<MDXEditor
							ref={editorRef}
							markdown={markdown}
							onChange={handleMarkdownChange}
							toolbarOptions={{
								lists: true,
								formatting: true,
								divs: false,
								links: false,
								barely: false,
								headings: true,
								undoRedo: true,
							}}
						/>
						{isOverLimit && (
							<Text variant='sm/normal' className='mt-2 text-red-500'>
								Content exceeds maximum character limit of{' '}
								{maxCharacters.toLocaleString()}
							</Text>
						)}

						{/* Save/Cancel buttons for content changes */}
						{hasUnsavedChanges && (
							<div className='mt-4 flex items-center justify-between border-t pt-4'>
								<Text variant='sm/normal' className='text-amber-600'>
									You have unsaved changes
								</Text>
								<div className='flex gap-2'>
									<Button
										onClick={handleCancelChanges}
										size='sm'
										look='outline'
										disabled={isProcessing}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveContent}
										size='sm'
										look='primary'
										disabled={!!isProcessing || !!isCtaIncomplete}
									>
										Save Changes
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Call to Action */}
					<div className='space-y-4'>
						<Text variant='sm/semibold'>Call to Action (optional)</Text>

						<div className='space-y-3'>
							<label className='block text-sm font-medium'>Button Target</label>
							<Select
								value={ctaType}
								onValueChange={(value: 'none' | 'url' | 'bio' | 'cart') => {
									setCtaType(value);
									// Clear previous values when changing type
									if (value !== 'url') setCtaUrl('');
									if (value !== 'bio') setCtaBioId(null);
									if (value !== 'cart') setCtaCartFunnelId(null);

									// Immediately update to clear unused fields
									switch (value) {
										case 'none':
											updateBlock({
												handle,
												id: blockId,
												targetUrl: null,
												targetBioId: null,
												targetCartFunnelId: null,
											});
											break;
										case 'url':
											// Clear bio and cart references when switching to URL
											updateBlock({
												handle,
												id: blockId,
												targetBioId: null,
												targetCartFunnelId: null,
											});
											break;
										case 'bio':
											// Clear URL and cart references when switching to bio
											updateBlock({
												handle,
												id: blockId,
												targetUrl: null,
												targetCartFunnelId: null,
											});
											break;
										case 'cart': {
											// Clear URL and bio references when switching to cart
											// Auto-select first cart funnel if available
											const firstFunnelId = cartFunnels?.cartFunnels[0]?.id;
											if (firstFunnelId) {
												setCtaCartFunnelId(firstFunnelId);
											}
											updateBlock({
												handle,
												id: blockId,
												targetUrl: null,
												targetBioId: null,
												targetCartFunnelId: firstFunnelId ?? null,
											});
											break;
										}
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select target type' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='none'>No Target</SelectItem>
									<SelectItem value='url'>Direct URL</SelectItem>
									<SelectItem value='bio'>Bio Page</SelectItem>
									<SelectItem value='cart'>Cart Funnel</SelectItem>
								</SelectContent>
							</Select>

							{ctaType === 'url' && (
								<div>
									<Input
										value={ctaUrl}
										onChange={e => {
											const newUrl = e.target.value;
											setCtaUrl(newUrl);
											// Optimistic update
											queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
												if (!oldBlocks) return oldBlocks;
												return oldBlocks.map(b => {
													if (b.id !== blockId) return b;
													return { ...b, targetUrl: newUrl || null };
												});
											});
										}}
										onBlur={() => {
											updateBlock({
												handle,
												id: blockId,
												targetUrl: ctaUrl || null,
											});
										}}
										type='url'
										placeholder='https://example.com'
									/>
								</div>
							)}

							{ctaType === 'bio' && (
								<Popover open={showBioSelector} onOpenChange={setShowBioSelector}>
									<PopoverTrigger asChild>
										<Button
											variant='button'
											look='outline'
											role='combobox'
											className='w-full justify-between'
										>
											{selectedBio ?
												`${selectedBio.handle}/${selectedBio.key}`
											:	'Select a bio page...'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-full p-0' align='start'>
										<Command>
											<CommandInput placeholder='Search bio pages...' />
											<CommandList>
												<CommandEmpty>No bio pages found.</CommandEmpty>
												<CommandGroup>
													{bios?.bios.map(bio => (
														<CommandItem
															key={bio.id}
															onSelect={() => {
																setCtaBioId(bio.id);
																setShowBioSelector(false);
																updateBlock({
																	handle,
																	id: blockId,
																	targetBioId: bio.id,
																	targetUrl: null,
																	targetCartFunnelId: null,
																});
															}}
														>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	ctaBioId === bio.id ? 'opacity-100' : 'opacity-0',
																)}
															/>
															<div className='flex-1'>
																<Text variant='sm/medium'>
																	{`${bio.handle}/${bio.key}`}
																</Text>
															</div>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							)}

							{ctaType === 'cart' && (
								<Popover open={showFunnelSelector} onOpenChange={setShowFunnelSelector}>
									<PopoverTrigger asChild>
										<Button
											variant='button'
											look='outline'
											role='combobox'
											aria-expanded={showFunnelSelector}
											className='w-full justify-between'
											startIcon={selectedFunnel ? 'check' : 'search'}
											endIcon='chevronDown'
										>
											{selectedFunnel ? selectedFunnel.name : 'Select a cart funnel...'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-full p-0' align='start'>
										<Command>
											<CommandInput placeholder='Search funnels...' />
											<CommandList>
												<CommandEmpty>
													{isLoadingFunnels ? 'Loading...' : 'No funnels found.'}
												</CommandEmpty>
												<CommandGroup>
													{cartFunnels?.cartFunnels.map(funnel => (
														<CommandItem
															key={funnel.id}
															value={funnel.name}
															onSelect={() => {
																setCtaCartFunnelId(funnel.id);
																setShowFunnelSelector(false);
																updateBlock({
																	handle,
																	id: blockId,
																	targetCartFunnelId: funnel.id,
																	targetUrl: null,
																	targetBioId: null,
																});
															}}
														>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	ctaCartFunnelId === funnel.id ?
																		'opacity-100'
																	:	'opacity-0',
																)}
															/>
															<div className='flex-1'>
																<Text variant='sm/medium'>{funnel.name}</Text>
															</div>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							)}

							{isCtaIncomplete && (
								<Text variant='xs/normal' className='text-red-500'>
									Please select a target for your CTA button
								</Text>
							)}

							<div>
								<label className='mb-2 block text-sm font-medium'>Button Text</label>
								<Input
									value={ctaText}
									onChange={e => handleCtaTextChange(e.target.value)}
									onBlur={() => {
										if (ctaText !== originalCtaText) {
											updateBlock({
												handle,
												id: blockId,
												ctaText: ctaText || null,
											});
										}
									}}
									placeholder='e.g., Learn More, Shop Now, Get Started'
									maxLength={100}
								/>
								<Text variant='xs/normal' className='mt-1 text-gray-500'>
									The text shown on the call-to-action button
								</Text>
							</div>
						</div>
					</div>

					{/* Save/Cancel buttons for unsaved changes */}
					{hasUnsavedChanges && (
						<div className='flex items-center justify-between border-t pt-4'>
							<Text variant='sm/normal' className='text-amber-600'>
								You have unsaved changes
							</Text>
							<div className='flex gap-2'>
								<Button onClick={handleCancelChanges} size='sm' look='outline'>
									Cancel
								</Button>
								<Button
									onClick={handleSaveContent}
									size='sm'
									look='primary'
									disabled={isCtaIncomplete || !hasImage}
								>
									Save Changes
								</Button>
							</div>
						</div>
					)}
				</TabsContent>

				{/* Layout Tab */}
				<TabsContent value='layout' className='space-y-6'>
					<div className='space-y-4'>
						<Text variant='sm/semibold'>Layout Settings</Text>

						{/* Desktop Layout */}
						<div>
							<label className='mb-2 flex items-center gap-2 text-sm font-medium'>
								<Laptop className='h-4 w-4' />
								Desktop Image Position
							</label>
							<div className='flex gap-2'>
								<Button
									variant='button'
									look={imageDesktopSide === 'left' ? 'primary' : 'outline'}
									size='sm'
									onClick={() => handleDesktopLayoutChange('left')}
								>
									Left
								</Button>
								<Button
									variant='button'
									look={imageDesktopSide === 'right' ? 'primary' : 'outline'}
									size='sm'
									onClick={() => handleDesktopLayoutChange('right')}
								>
									Right
								</Button>
							</div>
						</div>

						{/* Mobile Layout */}
						<div>
							<label className='mb-2 flex items-center gap-2 text-sm font-medium'>
								<Smartphone className='h-4 w-4' />
								Mobile Image Position
							</label>
							<div className='flex gap-2'>
								<Button
									variant='button'
									look={imageMobileSide === 'top' ? 'primary' : 'outline'}
									size='sm'
									onClick={() => handleMobileLayoutChange('top')}
								>
									Top
								</Button>
								<Button
									variant='button'
									look={imageMobileSide === 'bottom' ? 'primary' : 'outline'}
									size='sm'
									onClick={() => handleMobileLayoutChange('bottom')}
								>
									Bottom
								</Button>
							</div>
						</div>
					</div>

					{/* Visual Preview */}
					<div>
						<Text variant='sm/semibold' className='mb-2'>
							Layout Preview
						</Text>
						<div className='space-y-2'>
							{/* Desktop Preview */}
							<div className='rounded-lg border border-gray-200 p-4'>
								<Text variant='xs/medium' className='mb-2 text-gray-500'>
									Desktop View
								</Text>
								<div className='flex gap-2'>
									<div
										className={cn(
											'h-20 w-1/2 rounded bg-gray-300',
											imageDesktopSide === 'right' && 'order-2',
										)}
									>
										<div className='flex h-full items-center justify-center'>
											<Image className='h-8 w-8 text-gray-500' />
										</div>
									</div>
									<div className='flex w-1/2 flex-col gap-1'>
										<div className='h-3 rounded bg-gray-200' />
										<div className='h-2 rounded bg-gray-100' />
										<div className='h-2 rounded bg-gray-100' />
										{ctaText && <div className='mt-auto h-6 rounded bg-blue-200' />}
									</div>
								</div>
							</div>

							{/* Mobile Preview */}
							<div className='rounded-lg border border-gray-200 p-4'>
								<Text variant='xs/medium' className='mb-2 text-gray-500'>
									Mobile View
								</Text>
								<div className='flex flex-col gap-2'>
									<div
										className={cn(
											'h-20 w-full rounded bg-gray-300',
											imageMobileSide === 'bottom' && 'order-2',
										)}
									>
										<div className='flex h-full items-center justify-center'>
											<Image className='h-8 w-8 text-gray-500' />
										</div>
									</div>
									<div className='flex flex-col gap-1'>
										<div className='h-3 rounded bg-gray-200' />
										<div className='h-2 rounded bg-gray-100' />
										<div className='h-2 rounded bg-gray-100' />
										{ctaText && <div className='mt-2 h-6 rounded bg-blue-200' />}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Auto-save indicator */}
					{(imageDesktopSide !== originalImageDesktopSide ||
						imageMobileSide !== originalImageMobileSide) && (
						<div className='flex items-center justify-end pt-4'>
							<Text variant='sm/normal' className='text-amber-600'>
								Changes will save automatically...
							</Text>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Loading State */}
			{isProcessing && (
				<div className='absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm'>
					<div className='flex flex-col items-center gap-3'>
						<div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600' />
						<span className='text-sm font-medium text-gray-600'>
							{uploadingImage ? 'Uploading image...' : 'Saving changes...'}
						</span>
					</div>
				</div>
			)}
		</Card>
	);
}
