'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
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
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { GripVertical, Link2, Plus, User } from 'lucide-react';

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
type BioWithBlocksData = AppRouterOutputs['bio']['byKey'];
type BioBlockData = BioWithBlocksData['blocks'][number];

// Sortable Block Component
function SortableBlock({
	block,
	handle,
	onToggle,
	onDelete,
	onRename,
}: {
	block: BioBlockData;
	handle: string;
	onToggle: (id: string, enabled: boolean) => void;
	onDelete: (id: string) => void;
	onRename: (id: string, name: string) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: block.id });
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [showRenamePopover, setShowRenamePopover] = useState(false);
	const [editName, setEditName] = useState(
		block.name ?? (block.type === 'links' ? 'Links' : 'Contact Form'),
	);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<Card className='overflow-hidden'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='cursor-move' {...attributes} {...listeners}>
							<GripVertical className='h-5 w-5 text-gray-400' />
						</div>
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-lg ${
								block.type === 'links' ? 'bg-green-100' : 'bg-blue-100'
							}`}
						>
							<Link2
								className={`h-5 w-5 ${
									block.type === 'links' ? 'text-green-600' : 'text-blue-600'
								}`}
							/>
						</div>
						<div>
							{block.type === 'links' ?
								<Button
									href={`/${handle}/bio/home/links?blockId=${block.id}`}
									variant='button'
									look='text'
									className='h-auto p-0 text-left font-medium'
								>
									{block.name ?? 'Links'}
								</Button>
							:	<Text variant='md/medium' className='font-medium'>
									{block.name ?? 'Contact Form'}
								</Text>
							}
							{block.type === 'links' && (
								<Text variant='sm/normal' className='text-gray-500'>
									{block.links.length} {block.links.length === 1 ? 'link' : 'links'}
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
													window.location.href = `/${handle}/bio/home/links?blockId=${block.id}`;
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

export function BioBlocksPage() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const queryClient = useQueryClient();
	const [addBlockModalOpen, setAddBlockModalOpen] = useState(false);

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

	const queryKey = trpc.bio.byKey.queryOptions({
		handle,
		key: 'home',
	}).queryKey;

	const { data: bio } = useSuspenseQuery({
		...trpc.bio.byKey.queryOptions({
			handle,
			key: 'home',
		}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Mutations
	const createBlockMutation = useMutation(
		trpc.bio.createBlock.mutationOptions({
			onSettled: async () => {
				// Invalidate and refetch to get the real data with proper ID and lexoRank
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const updateBioMutation = useMutation(
		trpc.bio.update.mutationOptions({
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const updateBlockMutation = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const deleteBlockMutation = useMutation(
		trpc.bio.deleteBlock.mutationOptions({
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const reorderBlocksMutation = useMutation(
		trpc.bio.reorderBlocks.mutationOptions({
			onSettled: async () => {
				// Invalidate and refetch
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const handleAddBlock = (type: 'links' | 'contactForm') => {
		createBlockMutation.mutate({
			handle,
			bioId: bio.id,
			type,
			enabled: true,
		});
		setAddBlockModalOpen(false);
	};

	const handleToggleHeader = (checked: boolean) => {
		updateBioMutation.mutate({
			handle,
			id: bio.id,
			showHeader: checked,
		});
	};

	const handleToggleBlock = (blockId: string, enabled: boolean) => {
		updateBlockMutation.mutate({
			handle,
			id: blockId,
			enabled,
		});
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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = bio.blocks.findIndex(block => block.id === String(active.id));
			const newIndex = bio.blocks.findIndex(block => block.id === String(over.id));

			if (oldIndex !== -1 && newIndex !== -1) {
				const reordered = arrayMove([...bio.blocks], oldIndex, newIndex);

				// Submit reorder to backend
				reorderBlocksMutation.mutate({
					handle,
					bioId: bio.id,
					blockIds: reordered.map(block => block.id),
				});
			}
		}
	};

	// bio is guaranteed to be defined with useSuspenseQuery
	return (
		<div className='space-y-4'>
			{/* Add Block Button */}
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
						<Text variant='md/medium' className='font-medium'>
							Header
						</Text>
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
					items={bio.blocks.map(b => b.id)}
					strategy={verticalListSortingStrategy}
				>
					{bio.blocks.map(block => (
						<SortableBlock
							key={block.id}
							block={block}
							handle={handle}
							onToggle={handleToggleBlock}
							onDelete={handleDeleteBlock}
							onRename={handleRenameBlock}
						/>
					))}
				</SortableContext>
			</DndContext>

			{/* Add Block Modal */}
			<AddBlockModal
				open={addBlockModalOpen}
				onOpenChange={setAddBlockModalOpen}
				onAddBlock={handleAddBlock}
			/>
		</div>
	);
}
