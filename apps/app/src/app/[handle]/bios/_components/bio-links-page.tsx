'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { DragEndEvent } from '@dnd-kit/core';
import React, { useCallback, useState } from 'react';
import { BIO_BLOCK_ANIMATION_OPTIONS } from '@barely/const';
import { useZodForm } from '@barely/hooks';
import { between, cn } from '@barely/utils';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
	Clock,
	GripVertical,
	Image,
	Link2,
	Plus,
	Settings,
	Sparkles,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { DateTimePicker } from '@barely/ui/datetime-picker';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Img } from '@barely/ui/img';
import { Input } from '@barely/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Textarea } from '@barely/ui/textarea';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '~/app/[handle]/bios/_hooks/use-bio-query-state';
import { BioLinkImageModal } from './bio-link-image-modal';

interface BioLinksPageProps {
	handle: string;
	blockId: string;
}

// Type definitions
// type BioWithBlocks = AppRouterOutputs['bio']['byKey'];
type BioBlock = AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
type BioLink = BioBlock['links'][number];

// Custom hook for drag and drop reordering with proper animation handling
function useDragReorderLinks({
	handle,
	blockId,
	links,
	blocksQueryKey,
}: {
	handle: string;
	blockId: string;
	links: BioLink[];
	blocksQueryKey: unknown[];
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [tempLinks, setTempLinks] = useState<BioLink[] | null>(null);

	const { mutate: reorderLinks } = useMutation(
		trpc.bio.reorderLinks.mutationOptions({
			onMutate: async data => {
				// Cancel any outgoing refetches
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });

				// Get the previous data
				const previousBlocks = queryClient.getQueryData<BioBlock[]>(blocksQueryKey);

				// Optimistically update the cache
				if (previousBlocks) {
					const updatedBlocks = previousBlocks.map(block => {
						if (block.id !== blockId) return block;

						// Update the lexoRank for the moved link(s)
						const updatedLinks = block.links.map(link => {
							const movedLink = data.links.find(l => l.id === link.id);
							if (movedLink) {
								return { ...link, lexoRank: movedLink.lexoRank };
							}
							return link;
						});

						// Sort by lexoRank
						updatedLinks.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank));

						return { ...block, links: updatedLinks };
					});

					queryClient.setQueryData(blocksQueryKey, updatedBlocks);
				}

				return { previousBlocks };
			},
			onError: (_error, _variables, context) => {
				// Revert the optimistic update on error
				if (context?.previousBlocks) {
					queryClient.setQueryData(blocksQueryKey, context.previousBlocks);
				}
			},
			onSettled: async () => {
				// Always refetch after error or success to ensure we have the latest data
				await queryClient.invalidateQueries({ queryKey: blocksQueryKey });
				// Clear temporary state after mutation settles
				setTempLinks(null);
			},
		}),
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || active.id === over.id) {
				return;
			}

			const activeId = String(active.id);
			const overId = String(over.id);

			const oldIndex = links.findIndex(link => link.id === activeId);
			const newIndex = links.findIndex(link => link.id === overId);

			if (oldIndex === -1 || newIndex === -1) return;

			const movedLink = links[oldIndex];
			if (!movedLink) return;

			// Create a new array with the item removed from old position
			const linksWithoutMoved = links.filter(link => link.id !== activeId);

			// Determine the before and after links based on drag direction
			let beforeLink, afterLink;

			if (oldIndex < newIndex) {
				// Moving down: we want to insert AFTER the item at newIndex-1 in the filtered array
				// Example: moving 0→2, we want to insert after position 1 (C) in filtered array
				beforeLink = linksWithoutMoved[newIndex - 1] ?? null;
				afterLink = linksWithoutMoved[newIndex] ?? null;
			} else {
				// Moving up: we want to insert BEFORE the item at newIndex in the filtered array
				// The item at newIndex stays at newIndex after removal
				beforeLink = newIndex > 0 ? linksWithoutMoved[newIndex - 1] : null;
				afterLink = linksWithoutMoved[newIndex] ?? null;
			}

			// Calculate new lexoRank
			const newLexoRank = between(
				beforeLink?.lexoRank ?? undefined,
				afterLink?.lexoRank ?? undefined,
			);

			// Create the reordered array for temporary display
			const reorderedLinks = links.map(link =>
				link.id === movedLink.id ? { ...link, lexoRank: newLexoRank } : link,
			);
			reorderedLinks.sort((a, b) => a.lexoRank.localeCompare(b.lexoRank));

			// Set temporary state for immediate visual feedback
			setTempLinks(reorderedLinks);

			// Send update to server
			reorderLinks({
				handle,
				blockId,
				beforeLinkId: beforeLink?.id ?? null,
				afterLinkId: afterLink?.id ?? null,
				links: [
					{
						id: movedLink.id,
						lexoRank: newLexoRank,
					},
				],
			});
		},
		[links, handle, blockId, reorderLinks],
	);

	// Return the temporary links if they exist, otherwise the real links
	return {
		handleDragEnd,
		displayLinks: tempLinks ?? links,
	};
}

// Sortable Link Component
function SortableLink({
	link,
	onChange,
	onUpdate,
	onDelete,
	handle,
	blockId,
}: {
	link: BioLink;
	onChange: (id: string, data: Partial<BioLink>) => void;
	onUpdate: (id: string, data: Partial<BioLink>) => void;
	onDelete: (id: string) => void;
	handle: string;
	blockId: string;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({
			id: link.id,
			animateLayoutChanges: () => false,
		});
	const { bioKey } = useBioQueryState();

	const [localTitle, setLocalTitle] = useState(link.text);
	const [localUrl, setLocalUrl] = useState(link.url ?? '');
	const [localSubtitle, setLocalSubtitle] = useState(link.subtitle ?? '');
	const [originalTitle, setOriginalTitle] = useState(link.text);
	const [originalUrl, setOriginalUrl] = useState(link.url);
	const [originalSubtitle, setOriginalSubtitle] = useState(link.subtitle);
	const [showAnimationPopover, setShowAnimationPopover] = useState(false);
	const [showSchedulePopover, setShowSchedulePopover] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [isUrlFocused, setIsUrlFocused] = useState(false);
	const [startDate, setStartDate] = useState<Date | null>(
		link.startShowingAt ? new Date(link.startShowingAt) : null,
	);
	const [endDate, setEndDate] = useState<Date | null>(
		link.stopShowingAt ? new Date(link.stopShowingAt) : null,
	);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : undefined,
	};

	// Handle title change
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalTitle(e.target.value);
		onChange(link.id, { text: e.target.value });
	};

	// Handle URL change
	const handleUrlChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setLocalUrl(e.target.value);
	};

	// Handle subtitle change
	const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalSubtitle(e.target.value);
		onChange(link.id, { subtitle: e.target.value || null });
	};

	// Handle blur to trigger mutation
	const handleTitleBlur = () => {
		if (localTitle !== originalTitle) {
			onUpdate(link.id, { text: localTitle });
			setOriginalTitle(localTitle);
			toast.success('Link title updated');
		}
	};

	const handleUrlBlur = () => {
		setIsUrlFocused(false);
		if (localUrl !== originalUrl) {
			onUpdate(link.id, { url: localUrl });
			setOriginalUrl(localUrl);
			toast.success('Link URL updated');
		}
	};

	const handleSubtitleBlur = () => {
		if (localSubtitle !== originalSubtitle) {
			onUpdate(link.id, { subtitle: localSubtitle || null });
			setOriginalSubtitle(localSubtitle);
			toast.success('Link subtitle updated');
		}
	};

	const handleAnimationSelect = (animation: string) => {
		onUpdate(link.id, { animate: animation as BioLink['animate'] });
		setShowAnimationPopover(false);
	};

	const handleScheduleSave = () => {
		onUpdate(link.id, {
			startShowingAt: startDate,
			stopShowingAt: endDate,
		});
		setShowSchedulePopover(false);
	};

	const handleImageClick = () => {
		setShowImageModal(true);
	};

	return (
		<div ref={setNodeRef} style={style}>
			<Card className='overflow-hidden p-4'>
				<div className='flex items-center gap-4'>
					{/* Drag handle */}
					<div className='cursor-move' {...attributes} {...listeners}>
						<GripVertical className='h-5 w-5 text-gray-400' />
					</div>

					{/* Main content */}
					<div className='flex w-full flex-1 flex-col'>
						<div className='flex flex-row justify-between gap-2'>
							{/* Link content */}
							<div className='flex-1 space-y-1'>
								<Input
									value={localTitle}
									onChange={handleTitleChange}
									onBlur={handleTitleBlur}
									placeholder='Link title'
									variant='contentEditable'
									className='truncate text-base font-medium'
								/>
								{!isUrlFocused ?
									<Input
										value={localUrl}
										onChange={handleUrlChange}
										onFocus={() => setIsUrlFocused(true)}
										placeholder='https://example.com'
										variant='contentEditable'
										className='truncate text-sm text-muted-foreground'
									/>
								:	<Textarea
										value={localUrl}
										onChange={handleUrlChange}
										onFocus={() => setIsUrlFocused(true)}
										onBlur={handleUrlBlur}
										placeholder='https://example.com'
										variant='contentEditable'
										className='break-all text-sm text-muted-foreground'
										autoFocus
									/>
								}
								<Input
									value={localSubtitle}
									onChange={handleSubtitleChange}
									onBlur={handleSubtitleBlur}
									placeholder='Subtitle (optional)'
									variant='contentEditable'
									className='truncate text-sm text-muted-foreground'
								/>
							</div>
							{/* Image slot */}
							<button
								onClick={handleImageClick}
								className={cn(
									'flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition-colors',
									link.image?.s3Key ?
										'border-gray-200 hover:border-gray-300'
									:	'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
								)}
							>
								{link.image?.s3Key ?
									<Img
										s3Key={link.image.s3Key}
										blurDataURL={link.image.blurDataUrl ?? undefined}
										alt={link.text}
										width={80}
										height={80}
										className='h-full w-full object-cover'
									/>
								:	<Image className='h-6 w-6 text-gray-400' />}
							</button>
						</div>

						{/* Bottom controls */}
						<div className='mt-3 flex w-full items-center justify-between'>
							{/* Left side: Animation and Schedule buttons */}
							<div className='flex gap-1'>
								{/* Animation button */}
								<Popover
									open={showAnimationPopover}
									onOpenChange={setShowAnimationPopover}
								>
									<PopoverTrigger asChild>
										<Button
											variant='icon'
											look='ghost'
											size='sm'
											className={cn(
												link.animate && link.animate !== 'none' && 'text-yellow',
											)}
										>
											<Sparkles
												className='h-4 w-4'
												fill={
													link.animate && link.animate !== 'none' ?
														'currentColor'
													:	'none'
												}
											/>
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-80 p-4'>
										<Text variant='sm/semibold' className='mb-3'>
											Animate this link
										</Text>
										<Text variant='xs/normal' className='mb-4 text-gray-500'>
											Add an animation to your link for emphasis.
										</Text>
										<div className='grid grid-cols-3 gap-2'>
											{BIO_BLOCK_ANIMATION_OPTIONS.map(option => (
												<button
													key={option.value}
													onClick={() => handleAnimationSelect(option.value)}
													className={cn(
														'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-gray-50',
														link.animate === option.value ?
															'border-primary bg-primary/5'
														:	'border-gray-200',
													)}
												>
													<div
														className={cn(
															'h-10 w-full rounded bg-gray-300',
															option.animationClass,
														)}
													/>
													<Text variant='xs/medium'>{option.label}</Text>
												</button>
											))}
										</div>
									</PopoverContent>
								</Popover>

								{/* Schedule button */}
								<Popover open={showSchedulePopover} onOpenChange={setShowSchedulePopover}>
									<PopoverTrigger asChild>
										<Button
											variant='icon'
											look='ghost'
											size='sm'
											className={cn(
												(link.startShowingAt ?? link.stopShowingAt) && 'text-primary',
											)}
										>
											<Clock className='h-4 w-4' />
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-80 p-4'>
										<Text variant='sm/semibold' className='mb-3'>
											Schedule a link
										</Text>
										<Text variant='xs/normal' className='mb-4 text-gray-500'>
											Set when you want your link to be visible on your page.
										</Text>
										<div className='space-y-4'>
											<div>
												<label className='mb-2 block text-sm font-medium'>
													Show link on:
												</label>
												<DateTimePicker
													value={startDate ?? undefined}
													onChange={(date: Date | undefined) =>
														setStartDate(date ?? null)
													}
													granularity='minute'
													placeholder='Select start date'
													yearRange={5}
												/>
											</div>
											<div>
												<label className='mb-2 block text-sm font-medium'>
													Hide link on:
												</label>
												<DateTimePicker
													value={endDate ?? undefined}
													onChange={(date: Date | undefined) => setEndDate(date ?? null)}
													granularity='day'
													placeholder='Select end date'
													yearRange={5}
												/>
											</div>
											<Button onClick={handleScheduleSave} fullWidth>
												Save
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							</div>

							{/* Right side: Enable toggle and Delete button */}
							<div className='flex flex-col items-end gap-2'>
								<div className='flex items-center gap-2'>
									<Switch
										checked={link.enabled !== false}
										onCheckedChange={checked => onUpdate(link.id, { enabled: checked })}
									/>
									<button
										onClick={() => onDelete(link.id)}
										className='rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
									>
										<Trash2 className='h-4 w-4' />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Image Modal */}
			<BioLinkImageModal
				showModal={showImageModal}
				setShowModal={setShowImageModal}
				linkId={link.id}
				currentImage={link.image}
				handle={handle}
				blockId={blockId}
				bioKey={bioKey}
			/>
		</div>
	);
}

// Schema for add link form
const addLinkSchema = z.object({
	text: z.string().min(1, 'Title is required'),
	url: z.url('Please enter a valid URL'),
	subtitle: z.string().optional(),
});

type AddLinkData = z.infer<typeof addLinkSchema>;

// Add Link Form Component
function AddLinkForm({
	onAdd,
	onCancel,
}: {
	onAdd: (data: AddLinkData) => void;
	onCancel: () => void;
}) {
	const form = useZodForm({
		schema: addLinkSchema,
		defaultValues: {
			text: '',
			url: '',
			subtitle: '',
		},
	});

	const handleSubmit = (data: AddLinkData) => {
		onAdd(data);
		form.reset();
	};

	return (
		<Card className='overflow-hidden'>
			<Form form={form} onSubmit={handleSubmit}>
				<div className='space-y-3 p-4'>
					<TextField
						control={form.control}
						name='text'
						placeholder='Link title'
						className='font-medium'
						autoFocus
					/>
					<TextField
						control={form.control}
						name='url'
						type='url'
						placeholder='https://example.com'
					/>
					<TextField
						control={form.control}
						name='subtitle'
						placeholder='Subtitle (optional)'
						className='text-sm'
					/>
					<div className='flex gap-2'>
						<SubmitButton size='sm'>Add Link</SubmitButton>
						<Button type='button' size='sm' look='outline' onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</div>
			</Form>
		</Card>
	);
}

export function BioLinksPage({ handle, blockId }: BioLinksPageProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [showAddForm, setShowAddForm] = useState(false);
	const [activeTab, setActiveTab] = useState('links');
	const [editTitle, setEditTitle] = useState('');
	const [editSubtitle, setEditSubtitle] = useState('');
	const [blockName, setBlockName] = useState('');
	const { bioKey } = useBioQueryState();

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

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
			{ staleTime: 1000 * 60 * 5 }, // 5 minutes
		),
	);

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions(
			{ handle, key: bioKey },
			{ staleTime: 1000 * 60 * 5 }, // 5 minutes
		),
	);

	// Find the specific block
	const block = blocks.find(b => b.id === blockId);

	// Initialize form values when block loads
	React.useEffect(() => {
		if (block) {
			setEditTitle(block.title ?? '');
			setEditSubtitle(block.subtitle ?? '');
			setBlockName(block.name ?? 'Links Block');
		}
	}, [block]);

	// Mutations
	const { mutate: createLink } = useMutation(
		trpc.bio.createLink.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });
				const previousBlocks = queryClient.getQueryData(blocksQueryKey);
				if (!previousBlocks) return;

				const updatedBlocks = previousBlocks.map(block => {
					if (block.id !== blockId) return block;

					// Create a new link with the minimal structure needed for display
					// The server will replace this with the full structure
					const newLink = {
						// Core fields that we display
						id: `temp-${Date.now()}`,
						text: data.text,
						url: data.url,
						enabled: true,
						animate: null as BioLink['animate'],
						startShowingAt: null,
						stopShowingAt: null,

						// Required for sorting/positioning
						lexoRank: '0|hzzzzz:',
						blockId,

						// Relations (will be populated by server if needed)
						link: null,
						form: null,
					} as BioLink;

					return {
						...block,
						links: [...block.links, newLink],
					};
				});

				queryClient.setQueryData(blocksQueryKey, updatedBlocks);
				return { previousBlocks };
			},
			onError: (_error, _variables, context) => {
				queryClient.setQueryData(blocksQueryKey, context?.previousBlocks);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const { mutate: updateBlock } = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });
				const previousBlocks = queryClient.getQueryData(blocksQueryKey);
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
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
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

	// update
	const handleOptimisticUpdateLink = async (linkId: string, data: Partial<BioLink>) => {
		await queryClient.cancelQueries({ queryKey: blocksQueryKey });
		const previousBlocks = queryClient.getQueryData(blocksQueryKey);
		if (!previousBlocks) return;

		const updatedBlocks = previousBlocks.map(block => {
			if (block.id !== blockId) return block;

			return {
				...block,
				links: block.links.map(link =>
					link.id === linkId ? { ...link, ...data } : link,
				),
			};
		});

		queryClient.setQueryData(blocksQueryKey, updatedBlocks);
		return { previousBlocks };
	};

	const { mutate: updateLink } = useMutation(
		trpc.bio.updateLink.mutationOptions({
			onMutate: async data => {
				await handleOptimisticUpdateLink(data.id, data);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const { mutate: deleteLink } = useMutation(
		trpc.bio.deleteLink.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });
				const previousBlocks = queryClient.getQueryData(blocksQueryKey);
				if (!previousBlocks) return;

				const updatedBlocks = previousBlocks.map(block => {
					if (block.id !== blockId) return block;

					return {
						...block,
						links: block.links.filter(link => link.id !== data.linkId),
					};
				});

				queryClient.setQueryData(blocksQueryKey, updatedBlocks);
				return { previousBlocks };
			},
			onError: (_error, _variables, context) => {
				queryClient.setQueryData(blocksQueryKey, context?.previousBlocks);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const handleAddLink = (data: { text: string; url: string; subtitle?: string }) => {
		createLink({
			handle,
			blockId,
			text: data.text,
			url: data.url,
			subtitle: data.subtitle,
		});
		setShowAddForm(false);
	};

	const handleUpdateLink = (linkId: string, data: Partial<BioLink>) => {
		updateLink({
			handle,
			id: linkId,
			...data,
		});
	};

	const handleDeleteLink = (linkId: string) => {
		if (confirm('Are you sure you want to delete this link?')) {
			deleteLink({
				handle,
				blockId,
				linkId,
			});
		}
	};

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this entire block?')) {
			deleteBlock({
				handle,
				bioId: bio.id,
				blockId,
			});
		}
	};

	const handleSaveSettings = () => {
		if (!block) return;
		updateBlock({
			handle,
			id: blockId,
			title: editTitle || null,
			subtitle: editSubtitle || null,
		});
	};

	// Use the drag reorder hook with proper animation handling
	const { handleDragEnd, displayLinks } = useDragReorderLinks({
		handle,
		blockId,
		links: block?.links ?? [],
		blocksQueryKey,
	});

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
					href={`/${handle}/bios/blocks?bioKey=${bioKey}&scrollToBlock=${blockId}`}
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
					{/* Green icon like in bio-blocks-page */}
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100'>
						<Link2 className='h-5 w-5 text-green-600' />
					</div>
					<div className='flex-1'>
						<Input
							value={blockName}
							onChange={e => setBlockName(e.target.value)}
							onBlur={() => {
								if (blockName !== block.name) {
									updateBlock({ handle, id: blockId, name: blockName });
									toast.success('Block name updated');
								}
							}}
							variant='contentEditable'
							className='text-lg font-semibold'
							placeholder='Links Block'
						/>
						<Text variant='sm/normal' className='text-gray-500'>
							{displayLinks.length} {displayLinks.length === 1 ? 'link' : 'links'}
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
					<TabsTrigger value='links'>
						<Link2 className='mr-2 h-4 w-4' />
						Links
					</TabsTrigger>
					<TabsTrigger value='settings'>
						<Settings className='mr-2 h-4 w-4' />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Links Tab */}
				<TabsContent value='links' className='space-y-4'>
					{/* Add Link Button or Form */}
					{showAddForm ?
						<AddLinkForm onAdd={handleAddLink} onCancel={() => setShowAddForm(false)} />
					:	<Button
							onClick={() => setShowAddForm(true)}
							size='lg'
							variant='button'
							look='primary'
							fullWidth
							className='bg-gray-900 hover:bg-gray-800'
						>
							<Plus className='mr-2 h-5 w-5' />
							Add link
						</Button>
					}

					{/* Links list with drag and drop */}
					{displayLinks.length > 0 ?
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
							modifiers={[restrictToVerticalAxis]}
						>
							<SortableContext
								items={displayLinks.map(l => l.id)}
								strategy={verticalListSortingStrategy}
							>
								{displayLinks.map(link => (
									<SortableLink
										key={link.id}
										link={link}
										onChange={handleOptimisticUpdateLink}
										onUpdate={handleUpdateLink}
										onDelete={handleDeleteLink}
										handle={handle}
										blockId={blockId}
									/>
								))}
							</SortableContext>
						</DndContext>
					:	!showAddForm && (
							<Card className='p-8 text-center'>
								<Link2 className='mx-auto mb-3 h-12 w-12 text-gray-400' />
								<Text variant='lg/semibold' className='mb-2'>
									No links yet
								</Text>
								<Text variant='sm/normal' className='text-gray-500'>
									Add your first link to get started
								</Text>
							</Card>
						)
					}
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value='settings' className='space-y-4'>
					<div className='space-y-6'>
						<div>
							<Text variant='lg/semibold' className='mb-2'>
								Block Title (optional)
							</Text>
							<Text variant='sm/normal' className='mb-4 text-gray-500'>
								Help your audience find the link they're looking for by adding a title and
								description to this links block.
							</Text>
							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm font-medium'>Title</label>
									<Input
										value={editTitle}
										onChange={e => setEditTitle(e.target.value)}
										placeholder='Enter a title for this block'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm font-medium'>Subtitle</label>
									<Textarea
										value={editSubtitle}
										onChange={e => setEditSubtitle(e.target.value)}
										placeholder='Enter a subtitle'
										rows={2}
									/>
								</div>
							</div>
						</div>
						<div className='flex justify-end pt-4'>
							<Button onClick={handleSaveSettings} size='lg' look='primary'>
								Save Settings
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</Card>
	);
}
