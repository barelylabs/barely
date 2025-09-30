'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BioBlockType } from '@barely/const';
import type { DragEndEvent } from '@dnd-kit/core';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
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
	FileText,
	GripVertical,
	Image,
	LayoutPanelLeft,
	Link2,
	Mail,
	Plus,
	ShoppingCart,
	User,
} from 'lucide-react';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button, buttonVariants } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Command, CommandItem, CommandList } from '@barely/ui/command';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

import { AddBlockModal } from './add-block-modal';

// Type the bio data from tRPC
type BlocksData = AppRouterOutputs['bio']['blocksByHandleAndKey'];
type BioBlockData = BlocksData[number];

// Custom hook for drag and drop reordering with proper animation handling
function useDragReorderBlocks({
	handle,
	bioId,
	blocks,
	blocksQueryKey,
}: {
	handle: string;
	bioId: string;
	blocks: BioBlockData[];
	blocksQueryKey: unknown[];
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [tempBlocks, setTempBlocks] = useState<BioBlockData[] | null>(null);

	const { mutate: reorderBlocks } = useMutation(
		trpc.bio.reorderBlocks.mutationOptions({
			onMutate: async data => {
				// Cancel any outgoing refetches
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });

				// Get the previous data
				const previousBlocks = queryClient.getQueryData<BioBlockData[]>(blocksQueryKey);

				// Optimistically update the cache by reordering blocks based on blockIds
				if (previousBlocks) {
					// Create a map for quick lookup
					const blockMap = new Map(previousBlocks.map(block => [block.id, block]));

					// Reorder blocks based on the new blockIds order
					const updatedBlocks = data.blockIds
						.map(id => blockMap.get(id))
						.filter((block): block is BioBlockData => block !== undefined);

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
				setTempBlocks(null);
			},
		}),
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || active.id === over.id) {
				setTempBlocks(null);
				return;
			}

			const activeId = String(active.id);
			const overId = String(over.id);

			const oldIndex = blocks.findIndex(block => block.id === activeId);
			const newIndex = blocks.findIndex(block => block.id === overId);

			if (oldIndex === -1 || newIndex === -1) {
				setTempBlocks(null);
				return;
			}

			// Move the block to its new position
			const reorderedBlocks = [...blocks];
			const [movedBlock] = reorderedBlocks.splice(oldIndex, 1);
			if (movedBlock) {
				reorderedBlocks.splice(newIndex, 0, movedBlock);
			}

			// Set temporary state for immediate visual feedback
			setTempBlocks(reorderedBlocks);

			// Send update to server with the new order
			reorderBlocks({
				handle,
				bioId,
				blockIds: reorderedBlocks.map(block => block.id),
			});
		},
		[blocks, handle, bioId, reorderBlocks],
	);

	// Return the temporary blocks if they exist, otherwise the real blocks
	return {
		handleDragEnd,
		displayBlocks: tempBlocks ?? blocks,
	};
}

// Placeholder block component - shows while creating
function PlaceholderBlock() {
	return (
		<Card className='animate-pulse overflow-hidden opacity-50'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='h-5 w-5 rounded bg-gray-200' />
					<div className='h-10 w-10 rounded-lg bg-gray-200' />
					<div className='h-5 w-32 rounded bg-gray-200' />
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-6 w-11 rounded-full bg-gray-200' />
					<div className='h-8 w-8 rounded bg-gray-200' />
				</div>
			</div>
		</Card>
	);
}

// Insert Block Button Component - appears between blocks
function InsertBlockButton({ onClick, show }: { onClick: () => void; show: boolean }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:scale-110 hover:border-gray-400 hover:shadow-md',
				show ? 'opacity-100' : 'pointer-events-none opacity-0',
			)}
		>
			<Plus className='h-4 w-4 text-gray-400' />
		</button>
	);
}

// Sortable Block Component
function SortableBlock({
	block,
	handle,
	bioKey,
	onToggle,
	onDelete,
	onRename,
}: {
	block: BioBlockData;
	handle: string;
	bioKey: string;
	onToggle: (id: string, enabled: boolean) => void;
	onDelete: (id: string) => void;
	onRename: (id: string, name: string) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: block.id });
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [showRenamePopover, setShowRenamePopover] = useState(false);
	const getDefaultName = () => {
		switch (block.type) {
			case 'links':
				return 'Links';
			case 'contactForm':
				return 'Contact Form';
			case 'markdown':
				return 'Markdown';
			case 'image':
				return 'Image';
			case 'twoPanel':
				return 'Two Panel';
			case 'cart':
				return 'Cart';
			default:
				return 'Block';
		}
	};

	const [editName, setEditName] = useState(block.name ?? getDefaultName());

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} id={`block-${block.id}`}>
			<Card className='overflow-hidden'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='cursor-move' {...attributes} {...listeners}>
							<GripVertical className='h-5 w-5 text-gray-400' />
						</div>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-lg ${
								block.type === 'links' ? 'bg-green-100'
								: block.type === 'contactForm' ? 'bg-blue-100'
								: block.type === 'markdown' ? 'bg-purple-100'
								: block.type === 'image' ? 'bg-pink-100'
								: block.type === 'twoPanel' ? 'bg-orange-100'
								: block.type === 'cart' ? 'bg-indigo-100'
								: 'bg-gray-100'
							}`}
						>
							{block.type === 'links' ?
								<Link2 className='h-5 w-5 text-green-600' />
							: block.type === 'contactForm' ?
								<Mail className='h-5 w-5 text-blue-600' />
							: block.type === 'markdown' ?
								<FileText className='h-5 w-5 text-purple-600' />
							: block.type === 'image' ?
								<Image className='h-5 w-5 text-pink-600' />
							: block.type === 'twoPanel' ?
								<LayoutPanelLeft className='h-5 w-5 text-orange-600' />
							: block.type === 'cart' ?
								<ShoppingCart className='h-5 w-5 text-indigo-600' />
							:	<div className='h-5 w-5' />}
						</div>
						<div>
							{block.type === 'links' ?
								<Button
									href={`/${handle}/bios/links?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Links'}
								</Button>
							: block.type === 'markdown' ?
								<Button
									href={`/${handle}/bios/markdown?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Markdown'}
								</Button>
							: block.type === 'image' ?
								<Button
									href={`/${handle}/bios/image?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Image'}
								</Button>
							: block.type === 'twoPanel' ?
								<Button
									href={`/${handle}/bios/two-panel?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Two Panel'}
								</Button>
							: block.type === 'cart' ?
								<Button
									href={`/${handle}/bios/cart?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Cart'}
								</Button>
							: block.type === 'contactForm' ?
								<Button
									href={`/${handle}/bios/contact-form?bioKey=${bioKey}&blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Contact Form'}
								</Button>
							:	<Text variant='md/medium' className='font-medium'>
									{block.name ?? 'Block'}
								</Text>
							}
							{/* Block-specific descriptions */}
							{block.type === 'links' && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.links.length} {block.links.length === 1 ? 'link' : 'links'}
								</Text>
							)}
							{block.type === 'markdown' && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.title ??
										(() => {
											// Strip markdown formatting and truncate
											const plainText = (block.markdown ?? '')
												.replace(/[#*`[\]()]/g, '') // Remove common markdown characters
												.replace(/\n/g, ' ') // Replace newlines with spaces
												.trim();
											return plainText.length > 50 ?
													`${plainText.substring(0, 50)}...`
												:	plainText || 'Empty markdown block';
										})()}
								</Text>
							)}
							{block.type === 'image' && block.imageCaption && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.imageCaption}
								</Text>
							)}
							{block.type === 'twoPanel' && block.title && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.title}
								</Text>
							)}
							{block.type === 'cart' && block.title && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.title}
								</Text>
							)}
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Switch
							checked={block.enabled}
							onCheckedChange={checked => onToggle(block.id, checked)}
						/>
						<Popover
							open={showContextMenu}
							onOpenChange={open => {
								setShowContextMenu(open);
							}}
						>
							<PopoverTrigger asChild>
								<button
									type='button'
									className={cn(
										buttonVariants({
											variant: 'icon',
											look: 'ghost',
											size: 'sm',
										}),
										'text-slate-500',
									)}
								>
									<Icon.dotsVertical className='h-4 w-4' />
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-full p-2 sm:w-48' align='end'>
								<Command>
									<CommandList>
										<CommandItem
											className='justify-between'
											onSelect={() => {
												setShowContextMenu(false);
												// Navigate to edit page for this block
												if (block.type === 'links') {
													window.location.href = `/${handle}/bios/links?bioKey=${bioKey}&blockId=${block.id}`;
												} else if (block.type === 'markdown') {
													window.location.href = `/${handle}/bios/markdown?bioKey=${bioKey}&blockId=${block.id}`;
												} else if (block.type === 'image') {
													window.location.href = `/${handle}/bios/image?bioKey=${bioKey}&blockId=${block.id}`;
												} else if (block.type === 'twoPanel') {
													window.location.href = `/${handle}/bios/two-panel?bioKey=${bioKey}&blockId=${block.id}`;
												} else if (block.type === 'cart') {
													window.location.href = `/${handle}/bios/cart?bioKey=${bioKey}&blockId=${block.id}`;
												} else if (block.type === 'contactForm') {
													window.location.href = `/${handle}/bios/contact-form?bioKey=${bioKey}&blockId=${block.id}`;
												}
											}}
										>
											<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
												<Icon.edit className='h-4 w-4' />
												<p className='text-sm'>Edit</p>
											</div>
										</CommandItem>
										<CommandItem
											className='justify-between'
											onSelect={() => {
												setShowContextMenu(false);
												// Add a small delay to allow the context menu to close first
												setTimeout(() => {
													setShowRenamePopover(true);
												}, 100);
											}}
										>
											<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
												<Icon.tag className='h-4 w-4' />
												<p className='text-sm'>Rename</p>
											</div>
										</CommandItem>
										<CommandItem
											className='justify-between'
											onSelect={() => {
												setShowContextMenu(false);
												onDelete(block.id);
											}}
										>
											<div className='flex flex-row items-center justify-start gap-2 text-red-600'>
												<Icon.trash className='h-4 w-4' />
												<p className='text-sm'>Delete</p>
											</div>
										</CommandItem>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>

						{/* Rename Popover */}
						<Popover open={showRenamePopover} onOpenChange={setShowRenamePopover}>
							<PopoverTrigger asChild>
								<span />
							</PopoverTrigger>
							<PopoverContent className='w-80 p-4' align='end'>
								<div className='space-y-4'>
									<Text variant='sm/semibold'>Rename Block</Text>
									<Input
										value={editName}
										onChange={e => setEditName(e.target.value)}
										placeholder='Enter block name'
										autoFocus
										onKeyDown={e => {
											if (e.key === 'Enter') {
												onRename(block.id, editName);
												setShowRenamePopover(false);
											}
										}}
									/>
									<Button
										onClick={() => {
											onRename(block.id, editName);
											setShowRenamePopover(false);
										}}
										size='sm'
										fullWidth
									>
										Save
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</Card>
		</div>
	);
}

export function BioBlocksPage({ bioKey }: { bioKey: string }) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const queryClient = useQueryClient();
	const [addBlockModalOpen, setAddBlockModalOpen] = useState(false);
	const [newBlockId, setNewBlockId] = useState<string | null>(null);
	const [hoveredGapIndex, setHoveredGapIndex] = useState<number | null>(null);
	const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
	const [isCreatingBlockAtIndex, setIsCreatingBlockAtIndex] = useState<number | null>(
		null,
	);

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
			{
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		),
	);

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions(
			{ handle, key: bioKey },
			{
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		),
	);

	// Mutations
	const createBlockMutation = useMutation(
		trpc.bio.createBlock.mutationOptions({
			onSuccess: data => {
				// Capture the new block ID for scrolling

				if (!data) return;
				setNewBlockId(data.id);
			},
			onSettled: () => {
				// Clear the creating state
				setIsCreatingBlockAtIndex(null);
				// Invalidate and refetch to get the real data with proper ID and lexoRank
				void queryClient.invalidateQueries({ queryKey: bioQueryKey });
				void queryClient.invalidateQueries({ queryKey: blocksQueryKey });
			},
			onError: () => {
				// Clear the creating state on error
				setIsCreatingBlockAtIndex(null);
			},
		}),
	);

	const updateBlockMutation = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: blocksQueryKey });
				const previousBlocks = queryClient.getQueryData(blocksQueryKey);
				if (!previousBlocks) return;

				queryClient.setQueryData(
					blocksQueryKey,
					previousBlocks.map(block =>
						block.id === data.id ? { ...block, ...data } : block,
					),
				);
				return { previousBlocks };
			},
			onError: (error, variables, context) => {
				queryClient.setQueryData(blocksQueryKey, context?.previousBlocks);
			},
			onSettled: () => {
				// Invalidate and refetch
				void queryClient.invalidateQueries({ queryKey: blocksQueryKey });
				void queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const deleteBlockMutation = useMutation(
		trpc.bio.deleteBlock.mutationOptions({
			onSettled: () => {
				// Invalidate and refetch
				void queryClient.invalidateQueries({ queryKey: bioQueryKey });
				void queryClient.invalidateQueries({ queryKey: blocksQueryKey });
			},
		}),
	);

	const handleAddBlock = (type: BioBlockType, atIndex?: number) => {
		// Set the creating state to show placeholder
		if (atIndex !== undefined) {
			setIsCreatingBlockAtIndex(atIndex);
		}

		// Calculate prevBlockId and nextBlockId based on insertion position
		const baseData = {
			handle,
			bioId: bio.id,
			enabled: true,
			// If atIndex is provided, calculate neighboring blocks for proper insertion
			prevBlockId:
				atIndex !== undefined && atIndex > 0 ? blocks[atIndex - 1]?.id : undefined,
			nextBlockId: atIndex !== undefined ? blocks[atIndex]?.id : undefined,
		};

		switch (type) {
			case 'links':
				createBlockMutation.mutate({
					...baseData,
					type: 'links',
				});
				break;
			case 'contactForm':
				createBlockMutation.mutate({
					...baseData,
					type: 'contactForm',
				});
				break;
			case 'markdown':
				createBlockMutation.mutate({
					...baseData,
					type: 'markdown',
					markdown: '',
				});
				break;
			case 'image':
				createBlockMutation.mutate({
					...baseData,
					type: 'image',
					imageFileId: null,
					imageCaption: null,
					imageAltText: null,
				});
				break;
			case 'twoPanel':
				createBlockMutation.mutate({
					...baseData,
					type: 'twoPanel',
					title: '',
					markdown: '',
					imageFileId: null,
					imageMobileSide: 'top',
					imageDesktopSide: 'left',
				});
				break;
			case 'cart':
				createBlockMutation.mutate({
					...baseData,
					type: 'cart',
					title: null,
					subtitle: null,
					targetCartFunnelId: null,
				});
				break;
			case 'fm':
				break; // not supported yet
			case 'bio':
				break; // not supported yet
		}
		setAddBlockModalOpen(false);
		setInsertAtIndex(null);
	};

	const { mutate: mutateShowHeader } = useMutation(
		trpc.bio.update.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: bioQueryKey });
				const previousBio = queryClient.getQueryData(bioQueryKey);
				if (!previousBio) return;

				queryClient.setQueryData(bioQueryKey, {
					...previousBio,
					showHeader: data.showHeader ?? false,
				});
				return { previousBio };
			},
			onError: (error, variables, context) => {
				queryClient.setQueryData(bioQueryKey, context?.previousBio);
			},
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const handleToggleHeader = (checked: boolean) => {
		mutateShowHeader({
			handle,
			id: bio.id,
			showHeader: checked,
		});
	};

	const { mutate: mutateBarelyBranding } = useMutation(
		trpc.bio.update.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: bioQueryKey });
				const previousBio = queryClient.getQueryData(bioQueryKey);
				if (!previousBio) return;

				queryClient.setQueryData(bioQueryKey, {
					...previousBio,
					barelyBranding: data.barelyBranding ?? true,
				});
				return { previousBio };
			},
			onError: (error, variables, context) => {
				queryClient.setQueryData(bioQueryKey, context?.previousBio);
			},
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	const handleToggleBranding = (checked: boolean) => {
		mutateBarelyBranding({
			handle,
			id: bio.id,
			barelyBranding: checked,
		});
	};

	const handleToggleBlock = async (blockId: string, enabled: boolean) => {
		await updateBlockMutation.mutateAsync({
			handle,
			id: blockId,
			enabled,
		});
		// toast.success('Block updated');
	};

	const handleRenameBlock = (blockId: string, name: string) => {
		// Since name field is not in the updateBlock schema, we'll store it in settings
		updateBlockMutation.mutate({
			handle,
			id: blockId,
			name,
		});
	};

	const handleDeleteBlock = (blockId: string) => {
		if (confirm('Are you sure you want to delete this block?')) {
			deleteBlockMutation.mutate({
				handle,
				bioId: bio.id,
				blockId,
			});
		}
	};

	// Use the drag reorder hook with proper animation handling
	const { handleDragEnd, displayBlocks } = useDragReorderBlocks({
		handle,
		bioId: bio.id,
		blocks,
		blocksQueryKey,
	});

	// Auto-scroll to newly created blocks
	useEffect(() => {
		if (newBlockId && blocks.some(b => b.id === newBlockId)) {
			// Small delay to allow DOM to update
			setTimeout(() => {
				const element = document.getElementById(`block-${newBlockId}`);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					// Add highlight animation
					element.classList.add('animate-highlight');
					setTimeout(() => {
						element.classList.remove('animate-highlight');
					}, 2000);
				}
				setNewBlockId(null);
			}, 100);
		}
	}, [blocks, newBlockId]);

	// bio is guaranteed to be defined with useSuspenseQuery
	return (
		<div className='flex flex-col'>
			{/* Add Block Button */}
			<div className='mb-8'>
				<Button
					onClick={() => setAddBlockModalOpen(true)}
					size='lg'
					variant='button'
					look='primary'
					fullWidth
					className='bg-gray-900 hover:bg-gray-800'
				>
					<Plus className='mr-2 h-5 w-5' />
					Add block
				</Button>
			</div>

			{/* Header Block (always present) */}
			<Card className='overflow-hidden'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='invisible cursor-not-allowed'>
							<GripVertical className='h-5 w-5 text-gray-400' />
						</div>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900'>
							<User className='h-5 w-5 text-white' />
						</div>
						<Button
							href={`/${handle}/bios/header?bioKey=${bioKey}`}
							variant='button'
							look='text'
							className='h-auto p-0 text-left font-medium'
						>
							Header
						</Button>
					</div>
					<div className='flex items-center gap-2'>
						<Switch checked={bio.showHeader} onCheckedChange={handleToggleHeader} />
						<button
							type='button'
							className={cn(
								buttonVariants({
									variant: 'icon',
									look: 'ghost',
									size: 'sm',
								}),
								'invisible text-slate-500',
							)}
						>
							<Icon.dotsVertical className='h-4 w-4' />
						</button>
						<div />
					</div>
				</div>
			</Card>

			{/* Other Blocks - now draggable */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis]}
			>
				<SortableContext
					items={displayBlocks.map(b => b.id)}
					strategy={verticalListSortingStrategy}
				>
					{displayBlocks.map((block, index) => (
						<Fragment key={block.id}>
							{/* Insert button above each block */}
							{isCreatingBlockAtIndex === index ?
								<PlaceholderBlock />
							:	<div
									className='relative flex h-8 items-center justify-center'
									onMouseEnter={() => setHoveredGapIndex(index)}
									onMouseLeave={() => setHoveredGapIndex(null)}
								>
									<InsertBlockButton
										show={hoveredGapIndex === index}
										onClick={() => {
											setInsertAtIndex(index);
											setAddBlockModalOpen(true);
										}}
									/>
								</div>
							}

							{/* The actual block */}
							<SortableBlock
								block={block}
								handle={handle}
								bioKey={bioKey}
								onToggle={handleToggleBlock}
								onDelete={handleDeleteBlock}
								onRename={handleRenameBlock}
							/>
						</Fragment>
					))}

					{/* Insert button at the very bottom */}
					{isCreatingBlockAtIndex === displayBlocks.length ?
						<PlaceholderBlock />
					:	<div
							className='relative flex h-8 items-center justify-center'
							onMouseEnter={() => setHoveredGapIndex(displayBlocks.length)}
							onMouseLeave={() => setHoveredGapIndex(null)}
						>
							<InsertBlockButton
								show={hoveredGapIndex === displayBlocks.length}
								onClick={() => {
									setInsertAtIndex(displayBlocks.length);
									setAddBlockModalOpen(true);
								}}
							/>
						</div>
					}
				</SortableContext>
			</DndContext>

			{/* Add Block Button - Dashed Border Style */}
			<div>
				<button
					type='button'
					onClick={() => setAddBlockModalOpen(true)}
					className='flex h-14 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-50'
				>
					<Plus className='mr-2 h-5 w-5 text-gray-400' />
					<span className='text-sm font-medium text-gray-500'>Add block</span>
				</button>
			</div>

			{/* Branding Block */}
			<Card className='mt-8 overflow-hidden'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='invisible cursor-not-allowed'>
							<GripVertical className='h-5 w-5 text-gray-400' />
						</div>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100'>
							<Icon.star className='h-5 w-5 text-gray-600' />
						</div>
						<div>
							<Text variant='md/medium' className='font-medium'>
								Branding
							</Text>
							<Text variant='sm/normal' className='text-gray-500'>
								Show powered by barely.ai
							</Text>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Switch checked={bio.barelyBranding} onCheckedChange={handleToggleBranding} />
						<button
							type='button'
							className={cn(
								buttonVariants({
									variant: 'icon',
									look: 'ghost',
									size: 'sm',
								}),
								'invisible text-slate-500',
							)}
						>
							<Icon.dotsVertical className='h-4 w-4' />
						</button>
						<div />
					</div>
				</div>
			</Card>

			{/* Add Block Modal */}
			<AddBlockModal
				open={addBlockModalOpen}
				onOpenChange={setAddBlockModalOpen}
				onAddBlock={type => handleAddBlock(type, insertAtIndex ?? undefined)}
			/>
		</div>
	);
}
