'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { DragEndEvent } from '@dnd-kit/core';
import React, { useState } from 'react';
import { useZodForm } from '@barely/hooks';
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
import { Input } from '@barely/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Textarea } from '@barely/ui/textarea';
import { Text } from '@barely/ui/typography';

interface BioLinksPageProps {
	handle: string;
	blockId: string;
}

// Type definitions
type BioWithBlocks = AppRouterOutputs['bio']['byKey'];
type BioBlock = BioWithBlocks['blocks'][number];
type BioLink = BioBlock['links'][number];

// Animation options
const ANIMATION_OPTIONS = [
	{ value: 'none', label: 'NONE', animationClass: '' },
	{ value: 'bounce', label: 'BOUNCE', animationClass: 'animate-bio-bounce' },
	{ value: 'jello', label: 'JELLO', animationClass: 'animate-bio-jello' },
	{ value: 'wobble', label: 'WOBBLE', animationClass: 'animate-bio-wiggle' },
	{ value: 'pulse', label: 'PULSE', animationClass: 'animate-bio-pulse' },
	{ value: 'shake', label: 'SHAKE', animationClass: 'animate-bio-shake' },
	{ value: 'tada', label: 'TADA', animationClass: 'animate-bio-tada' },
] as const;

// Sortable Link Component
function SortableLink({
	link,
	onUpdate,
	onDelete,
}: {
	link: BioLink;
	onUpdate: (id: string, data: Partial<BioLink>) => void;
	onDelete: (id: string) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: link.id });

	const [localTitle, setLocalTitle] = useState(link.text);
	const [localUrl, setLocalUrl] = useState(link.url ?? '');
	const [originalTitle, setOriginalTitle] = useState(link.text);
	const [originalUrl, setOriginalUrl] = useState(link.url);
	const [showAnimationPopover, setShowAnimationPopover] = useState(false);
	const [showSchedulePopover, setShowSchedulePopover] = useState(false);
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
	};

	// Handle title change
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalTitle(e.target.value);
	};

	// Handle URL change
	const handleUrlChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setLocalUrl(e.target.value);
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
		// TODO: Open media library modal
		// For now, just use a simple URL prompt
		const imageUrl = prompt('Enter image URL:');
		if (imageUrl) {
			// Note: imageUrl is not in the BioLinks schema yet
			// This will need to be added to the database schema
			console.log('Image URL selected:', imageUrl);
		}
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
							</div>
							{/* Image slot */}
							<button
								onClick={handleImageClick}
								className='flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100'
							>
								{/* TODO: Add imageUrl to BioLinks schema */}
								<Image className='h-6 w-6 text-gray-400' />
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
											{ANIMATION_OPTIONS.map(option => (
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
		</div>
	);
}

// Schema for add link form
const addLinkSchema = z.object({
	text: z.string().min(1, 'Title is required'),
	url: z.url('Please enter a valid URL'),
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

	// Find the specific block
	const block = bio.blocks.find(b => b.id === blockId);

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
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const { mutate: updateBlock } = useMutation(
		trpc.bio.updateBlock.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const { mutate: deleteBlock } = useMutation(
		trpc.bio.deleteBlock.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const { mutate: updateLink } = useMutation(
		trpc.bio.updateLink.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const { mutate: deleteLink } = useMutation(
		trpc.bio.deleteLink.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const { mutate: reorderLinks } = useMutation(
		trpc.bio.reorderLinks.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey });
			},
		}),
	);

	const handleAddLink = (data: { text: string; url: string }) => {
		createLink({
			handle,
			blockId,
			text: data.text,
			url: data.url,
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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id && block) {
			const oldIndex = block.links.findIndex(link => link.id === String(active.id));
			const newIndex = block.links.findIndex(link => link.id === String(over.id));

			if (oldIndex !== -1 && newIndex !== -1) {
				const reordered = arrayMove([...block.links], oldIndex, newIndex);

				// Submit reorder to backend
				reorderLinks({
					handle,
					blockId,
					linkIds: reordered.map(link => link.id),
				});
			}
		}
	};

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
					href={`/${handle}/bio/home/blocks`}
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
							{block.links.length} {block.links.length === 1 ? 'link' : 'links'}
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
					{block.links.length > 0 ?
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
							modifiers={[restrictToVerticalAxis]}
						>
							<SortableContext
								items={block.links.map(l => l.id)}
								strategy={verticalListSortingStrategy}
							>
								{block.links.map(link => (
									<SortableLink
										key={link.id}
										link={link}
										onUpdate={handleUpdateLink}
										onDelete={handleDeleteLink}
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
