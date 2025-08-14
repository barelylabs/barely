'use client';

import type { BioButtonWithLink, BioWithButtons } from '@barely/validators';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import {
	closestCenter,
	DndContext,
	DragOverlay,
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
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { BioButtonItem } from './bio-button-item';
import { BioButtonModal } from './bio-button-modal';

interface BioButtonListProps {
	bioId: string;
	handle: string;
	buttons: (BioButtonWithLink & { lexoRank: string })[];
	editable?: boolean;
}

export function BioButtonList({
	bioId,
	handle,
	buttons,
	editable = false,
}: BioButtonListProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const [activeId, setActiveId] = useState<string | null>(null);
	const [items, setItems] = useState(buttons);
	const [showButtonModal, setShowButtonModal] = useState(false);
	const [editingButton, setEditingButton] = useState<BioButtonWithLink | null>(null);

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

	const reorderMutation = useMutation({
		...trpc.bio.reorderButtons.mutationOptions(),
		onMutate: async ({ buttonIds }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});

			// Snapshot the previous value
			const previousBio = queryClient.getQueryData(
				trpc.bio.byHandle.queryKey({ handle }),
			);

			// Optimistically update to the new value
			queryClient.setQueryData(
				trpc.bio.byHandle.queryKey({ handle }),
				(old: BioWithButtons | undefined) => {
					if (!old) return old;

					// Create a mapping of buttonId to new index
					const newOrder = new Map(buttonIds.map((id, index) => [id, index]));

					// Sort buttons based on the new order
					const reorderedButtons = [...(old.buttons ?? [])].sort((a, b) => {
						const aIndex = newOrder.get(a.id) ?? 999;
						const bIndex = newOrder.get(b.id) ?? 999;
						return aIndex - bIndex;
					});

					return {
						...old,
						buttons: reorderedButtons,
					};
				},
			);

			// Return a context with the previous value
			return { previousBio };
		},
		onError: (error, _variables, context) => {
			// If the mutation fails, use the context to roll back
			if (context?.previousBio) {
				queryClient.setQueryData(
					trpc.bio.byHandle.queryKey({ handle }),
					context.previousBio,
				);
			}
			toast.error(error.message ?? 'Failed to reorder buttons');
		},
		onSettled: () => {
			// Always refetch after error or success
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
		},
	});

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(String(event.active.id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setItems(prev => {
				const oldIndex = prev.findIndex(item => item.id === String(active.id));
				const newIndex = prev.findIndex(item => item.id === String(over.id));

				const reordered = arrayMove(prev, oldIndex, newIndex);

				// Submit reorder to backend
				reorderMutation.mutate({
					handle,
					bioId,
					buttonIds: reordered.map(item => item.id),
				});

				return reordered;
			});
		}

		setActiveId(null);
	};

	const handleEditButton = (button: BioButtonWithLink) => {
		setEditingButton(button);
		setShowButtonModal(true);
	};

	const handleAddButton = () => {
		setEditingButton(null);
		setShowButtonModal(true);
	};

	const activeItem = activeId ? items.find(item => item.id === activeId) : null;

	if (!editable) {
		return (
			<div className='flex flex-col gap-3'>
				{items.map(button => (
					<BioButtonItem
						key={button.id}
						button={button}
						bioId={bioId}
						handle={handle}
						editable={false}
					/>
				))}
			</div>
		);
	}

	return (
		<>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<Text variant='lg/semibold'>Bio Links</Text>
					<Button size='sm' startIcon='add' onClick={handleAddButton}>
						Add Link
					</Button>
				</div>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={items.map(i => i.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className='flex flex-col gap-2'>
							{items.map(button => (
								<BioButtonItem
									key={button.id}
									button={button}
									bioId={bioId}
									handle={handle}
									editable={true}
									onEdit={() => handleEditButton(button)}
								/>
							))}
						</div>
					</SortableContext>

					<DragOverlay>
						{activeItem ?
							<div className='w-full rounded-lg border bg-background p-3 shadow-lg'>
								<div className='flex items-center gap-2'>
									<Icon.grip className='h-4 w-4 text-muted-foreground' />
									<Text>{activeItem.text}</Text>
								</div>
							</div>
						:	null}
					</DragOverlay>
				</DndContext>

				{items.length === 0 && (
					<div className='rounded-lg border border-dashed p-8 text-center'>
						<Icon.link className='mx-auto h-12 w-12 text-muted-foreground' />
						<Text variant='lg/semibold' className='mt-2'>
							No buttons yet
						</Text>
						<Text variant='sm/normal' className='text-muted-foreground'>
							Add your first button to get started
						</Text>
						<Button size='sm' className='mt-4' startIcon='add' onClick={handleAddButton}>
							Add Your First Button
						</Button>
					</div>
				)}
			</div>

			{/* Button Modal */}
			<BioButtonModal
				open={showButtonModal}
				onOpenChange={setShowButtonModal}
				bioId={bioId}
				handle={handle}
				button={editingButton}
			/>
		</>
	);
}
