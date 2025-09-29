'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import React, { useState } from 'react';
import { BIO_BLOCK_ANIMATION_OPTIONS, BIO_BLOCK_ICON_OPTIONS } from '@barely/const';
import { cn } from '@barely/utils';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { Check, Settings, ShoppingCart, Trash2 } from 'lucide-react';
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
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

interface BioCartPageProps {
	handle: string;
	blockId: string;
}

type BioBlock = AppRouterOutputs['bio']['blocksByHandleAndKey'][number];

export function BioCartPage({ handle, blockId }: BioCartPageProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('content');
	const [blockName, setBlockName] = useState('');
	const [editTitle, setEditTitle] = useState('');
	const [editSubtitle, setEditSubtitle] = useState('');
	const [editCtaText, setEditCtaText] = useState('');
	const [ctaAnimation, setCtaAnimation] = useState<string>('none');
	const [ctaIcon, setCtaIcon] = useState<string>('none');
	const [learnMoreText, setLearnMoreText] = useState('');
	const [learnMoreUrl, setLearnMoreUrl] = useState('');
	const [learnMoreBioId, setLearnMoreBioId] = useState<string | null>(null);
	const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [showAnimationPopover, setShowAnimationPopover] = useState(false);
	const [showIconPopover, setShowIconPopover] = useState(false);
	const [learnMoreType, setLearnMoreType] = useState<'none' | 'url' | 'bio'>('none');
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

	// Store original values for blur comparison (block is guaranteed to exist with useSuspenseQuery)
	const [originalTitle] = useState(block?.title ?? '');
	const [originalSubtitle] = useState(block?.subtitle ?? '');
	const [originalCtaText] = useState(block?.ctaText ?? '');
	const [originalLearnMoreText] = useState(block?.learnMoreText ?? '');
	const [originalLearnMoreUrl] = useState(block?.learnMoreUrl ?? '');

	// Fetch cart funnels for the workspace
	const { data: cartFunnels, isLoading: isLoadingFunnels } = useQuery(
		trpc.cartFunnel.byWorkspace.queryOptions({
			handle,
			search: '',
			showArchived: false,
			showDeleted: false,
		}),
	);

	// Fetch bio pages for learn more selector
	const { data: bios } = useQuery(
		trpc.bio.byWorkspace.queryOptions({
			handle,
			search: '',
		}),
	);

	// Initialize form values when block loads
	React.useEffect(() => {
		if (block) {
			setEditTitle(block.title ?? '');
			setEditSubtitle(block.subtitle ?? '');
			setEditCtaText(block.ctaText ?? '');
			setCtaAnimation(block.ctaAnimation ?? 'none');
			setCtaIcon(block.ctaIcon ?? 'none');
			setLearnMoreText(block.learnMoreText ?? '');
			setLearnMoreUrl(block.learnMoreUrl ?? '');
			setLearnMoreBioId(block.learnMoreBioId ?? null);
			setBlockName(block.name ?? 'Cart Block');
			setSelectedFunnelId(block.targetCartFunnelId ?? null);

			// Determine learn more type
			if (block.learnMoreBioId) {
				setLearnMoreType('bio');
			} else if (block.learnMoreUrl) {
				setLearnMoreType('url');
			} else {
				setLearnMoreType('none');
			}
		}
	}, [block]);

	// Get selected funnel details
	const selectedFunnel = cartFunnels?.cartFunnels.find(
		(f: { id: string }) => f.id === selectedFunnelId,
	);

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
			onSuccess: () => {
				toast.success('Block updated');
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

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this cart block?')) {
			deleteBlock({
				handle,
				bioId: bio.id,
				blockId,
			});
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
					href={`/${handle}/bios/blocks?bioKey=${bio.key}`}
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
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100'>
						<ShoppingCart className='h-5 w-5 text-orange-600' />
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
							placeholder='Cart Block'
						/>
						<Text variant='sm/normal' className='text-gray-500'>
							{selectedFunnel ? selectedFunnel.name : 'No funnel selected'}
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
					<TabsTrigger value='content'>
						<ShoppingCart className='mr-2 h-4 w-4' />
						Content
					</TabsTrigger>
					<TabsTrigger value='settings'>
						<Settings className='mr-2 h-4 w-4' />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Content Tab */}
				<TabsContent value='content' className='space-y-4'>
					<div className='space-y-6'>
						{/* Cart Funnel Selector */}
						<div>
							<label className='mb-2 block text-sm font-medium'>
								Cart Funnel <span className='text-red-500'>*</span>
							</label>
							<Text variant='xs/normal' className='mb-4 text-gray-500'>
								Select which cart funnel to display on your bio page.
							</Text>

							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										variant='button'
										look='outline'
										role='combobox'
										aria-expanded={open}
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
															setSelectedFunnelId(funnel.id);
															setOpen(false);
															updateBlock({
																handle,
																id: blockId,
																targetCartFunnelId: funnel.id,
															});
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																selectedFunnelId === funnel.id ?
																	'opacity-100'
																:	'opacity-0',
															)}
														/>
														<div className='flex-1'>
															<Text variant='sm/medium'>{funnel.name}</Text>
															{/* Main product name would go here if loaded */}
															{/* {funnel.products && funnel.products.length > 0 && (
																<Text variant='xs/normal' className='text-gray-500'>
																	{funnel.products.length}{' '}
																	{funnel.products.length === 1 ? 'product' : 'products'}
																</Text>
															)} */}
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						{/* Title/Subtitle Overrides */}
						<div className='space-y-4'>
							<Text variant='sm/semibold'>Display Options (optional)</Text>
							<Text variant='xs/normal' className='text-gray-500'>
								Override the default funnel title and description for this bio page.
							</Text>

							<div>
								<label className='mb-2 block text-sm font-medium'>Custom Title</label>
								<Input
									value={editTitle}
									onChange={e => {
										const newTitle = e.target.value;
										setEditTitle(newTitle);
										// Optimistically update cache for preview
										const previousBlocks =
											queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
										if (previousBlocks) {
											const updatedBlocks = previousBlocks.map(b => {
												if (b.id !== blockId) return b;
												return { ...b, title: newTitle || null };
											});
											queryClient.setQueryData(blocksQueryKey, updatedBlocks);
										}
									}}
									onBlur={() => {
										if (editTitle !== originalTitle) {
											updateBlock({
												handle,
												id: blockId,
												title: editTitle || null,
											});
										}
									}}
									placeholder={selectedFunnel?.name ?? 'Enter custom title'}
								/>
							</div>

							<div>
								<label className='mb-2 block text-sm font-medium'>Custom Subtitle</label>
								<Input
									value={editSubtitle}
									onChange={e => {
										const newSubtitle = e.target.value;
										setEditSubtitle(newSubtitle);
										// Optimistically update cache for preview
										const previousBlocks =
											queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
										if (previousBlocks) {
											const updatedBlocks = previousBlocks.map(b => {
												if (b.id !== blockId) return b;
												return { ...b, subtitle: newSubtitle || null };
											});
											queryClient.setQueryData(blocksQueryKey, updatedBlocks);
										}
									}}
									onBlur={() => {
										if (editSubtitle !== originalSubtitle) {
											updateBlock({
												handle,
												id: blockId,
												subtitle: editSubtitle || null,
											});
										}
									}}
									placeholder='Enter custom subtitle'
								/>
							</div>

							<div>
								<label className='mb-2 block text-sm font-medium'>
									Button Text (CTA)
								</label>
								<Input
									value={editCtaText}
									onChange={e => {
										const newCtaText = e.target.value;
										setEditCtaText(newCtaText);
										// Optimistically update cache for preview
										const previousBlocks =
											queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
										if (previousBlocks) {
											const updatedBlocks = previousBlocks.map(b => {
												if (b.id !== blockId) return b;
												return { ...b, ctaText: newCtaText || null };
											});
											queryClient.setQueryData(blocksQueryKey, updatedBlocks);
										}
									}}
									onBlur={() => {
										if (editCtaText !== originalCtaText) {
											updateBlock({
												handle,
												id: blockId,
												ctaText: editCtaText || null,
											});
										}
									}}
									placeholder='Get Instant Access'
								/>
								<Text variant='xs/normal' className='mt-1 text-gray-500'>
									The text shown on the checkout button. Defaults to "Get Instant Access".
								</Text>
							</div>

							{/* Button Animation and Icon */}
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='mb-2 block text-sm font-medium'>
										Button Animation
									</label>
									<Popover
										open={showAnimationPopover}
										onOpenChange={setShowAnimationPopover}
									>
										<PopoverTrigger asChild>
											<Button
												variant='button'
												look='outline'
												className='w-full justify-between'
												startIcon={ctaAnimation !== 'none' ? 'sparkles' : undefined}
											>
												{BIO_BLOCK_ANIMATION_OPTIONS.find(
													opt => opt.value === ctaAnimation,
												)?.label ?? 'NONE'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-80 p-4'>
											<Text variant='sm/semibold' className='mb-3'>
												Animate the button
											</Text>
											<Text variant='xs/normal' className='mb-4 text-gray-500'>
												Add an animation to draw attention to your CTA.
											</Text>
											<div className='grid grid-cols-3 gap-2'>
												{BIO_BLOCK_ANIMATION_OPTIONS.map(option => (
													<button
														key={option.value}
														onClick={() => {
															setCtaAnimation(option.value);
															setShowAnimationPopover(false);
															updateBlock({
																handle,
																id: blockId,
																ctaAnimation:
																	option.value !== 'none' ? option.value : null,
															});
														}}
														className={cn(
															'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:bg-gray-50',
															ctaAnimation === option.value ?
																'border-primary bg-primary/5'
															:	'border-gray-200',
														)}
													>
														<Text variant='xs/medium'>{option.label}</Text>
													</button>
												))}
											</div>
										</PopoverContent>
									</Popover>
								</div>

								<div>
									<label className='mb-2 block text-sm font-medium'>Button Icon</label>
									<Popover open={showIconPopover} onOpenChange={setShowIconPopover}>
										<PopoverTrigger asChild>
											<Button
												variant='button'
												look='outline'
												className='w-full justify-between'
												startIcon={
													ctaIcon !== 'none' ?
														(BIO_BLOCK_ICON_OPTIONS.find(opt => opt.value === ctaIcon)
															?.icon ?? undefined)
													:	undefined
												}
											>
												{BIO_BLOCK_ICON_OPTIONS.find(opt => opt.value === ctaIcon)
													?.label ?? 'NONE'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-80 p-4'>
											<Text variant='sm/semibold' className='mb-3'>
												Choose button icon
											</Text>
											<Text variant='xs/normal' className='mb-4 text-gray-500'>
												Select an icon to display in your CTA button.
											</Text>
											<div className='grid grid-cols-3 gap-2'>
												{BIO_BLOCK_ICON_OPTIONS.map(option => {
													const CtaIcon =
														option.icon ? Icon[option.icon as keyof typeof Icon] : null;

													return (
														<button
															key={option.value}
															onClick={() => {
																setCtaIcon(option.value);
																setShowIconPopover(false);
																updateBlock({
																	handle,
																	id: blockId,
																	ctaIcon: option.value !== 'none' ? option.value : null,
																});
															}}
															className={cn(
																'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:bg-gray-50',
																ctaIcon === option.value ?
																	'border-primary bg-primary/5'
																:	'border-gray-200',
															)}
														>
															{CtaIcon ?
																<CtaIcon className='h-5 w-5' />
															:	<div className='h-5 w-5' />}
															<Text variant='xs/medium'>{option.label}</Text>
														</button>
													);
												})}
											</div>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							{/* Learn More Link */}
							<div className='space-y-3'>
								<label className='block text-sm font-medium'>
									Learn More Link (optional)
								</label>
								<Select
									value={learnMoreType}
									onValueChange={(value: 'none' | 'url' | 'bio') => {
										setLearnMoreType(value);
										// Clear the learn more values when changing type
										switch (value) {
											case 'none':
												updateBlock({
													handle,
													id: blockId,
													learnMoreText: null,
													learnMoreUrl: null,
													learnMoreBioId: null,
												});
												break;
											case 'url':
												updateBlock({
													handle,
													id: blockId,
													learnMoreBioId: null,
												});
												break;
											case 'bio':
												updateBlock({
													handle,
													id: blockId,
													learnMoreUrl: null,
												});
												break;
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder='Select link type' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='none'>No Learn More Link</SelectItem>
										<SelectItem value='url'>Direct URL</SelectItem>
										<SelectItem value='bio'>Bio Page</SelectItem>
									</SelectContent>
								</Select>

								{learnMoreType !== 'none' && (
									<>
										{learnMoreType === 'url' && (
											<Input
												value={learnMoreUrl}
												onChange={e => {
													const newLearnMoreUrl = e.target.value;
													setLearnMoreUrl(newLearnMoreUrl);
													// Optimistically update cache for preview
													const previousBlocks =
														queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
													if (previousBlocks) {
														const updatedBlocks = previousBlocks.map(b => {
															if (b.id !== blockId) return b;
															return { ...b, learnMoreUrl: newLearnMoreUrl || null };
														});
														queryClient.setQueryData(blocksQueryKey, updatedBlocks);
													}
												}}
												onBlur={() => {
													if (learnMoreUrl !== originalLearnMoreUrl) {
														updateBlock({
															handle,
															id: blockId,
															learnMoreUrl: learnMoreUrl || null,
														});
													}
												}}
												type='url'
												placeholder='https://example.com/more-info'
											/>
										)}

										{learnMoreType === 'bio' && (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant='button'
														look='outline'
														role='combobox'
														className='w-full justify-between'
													>
														{learnMoreBioId && bios?.bios ?
															(() => {
																const selectedBio = bios.bios.find(
																	b => b.id === learnMoreBioId,
																);
																return selectedBio ?
																		`${selectedBio.handle}/${selectedBio.key}`
																	:	'Select a bio page...';
															})()
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
																			setLearnMoreBioId(bio.id);
																			updateBlock({
																				handle,
																				id: blockId,
																				learnMoreBioId: bio.id,
																			});
																		}}
																	>
																		<Check
																			className={cn(
																				'mr-2 h-4 w-4',
																				learnMoreBioId === bio.id ?
																					'opacity-100'
																				:	'opacity-0',
																			)}
																		/>
																		<div className='flex-1'>
																			<Icon.bio className='h-4 w-4' />
																			<Text variant='sm/medium'>
																				{`${bio.handle}/${bio.key}`}
																			</Text>
																			<Text variant='xs/normal' className='text-gray-500'>
																				{bio.handle}/{bio.key}
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

										<Input
											value={learnMoreText}
											onChange={e => {
												const newLearnMoreText = e.target.value;
												setLearnMoreText(newLearnMoreText);
												// Optimistically update cache for preview
												const previousBlocks =
													queryClient.getQueryData<BioBlock[]>(blocksQueryKey);
												if (previousBlocks) {
													const updatedBlocks = previousBlocks.map(b => {
														if (b.id !== blockId) return b;
														return { ...b, learnMoreText: newLearnMoreText || null };
													});
													queryClient.setQueryData(blocksQueryKey, updatedBlocks);
												}
											}}
											onBlur={() => {
												if (learnMoreText !== originalLearnMoreText) {
													updateBlock({
														handle,
														id: blockId,
														learnMoreText: learnMoreText || null,
													});
												}
											}}
											placeholder='Learn more'
										/>
										<Text variant='xs/normal' className='text-gray-500'>
											Link text that appears below the CTA button
										</Text>
									</>
								)}
							</div>
						</div>
					</div>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value='settings' className='space-y-4'>
					<div className='space-y-6'>
						<div>
							<Text variant='lg/semibold' className='mb-2'>
								Advanced Settings
							</Text>
							<Text variant='sm/normal' className='mb-4 text-gray-500'>
								Additional configuration options for your cart block.
							</Text>

							{/* Style as Button Toggle */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between rounded-lg border p-4'>
									<div className='space-y-1'>
										<label className='text-sm font-medium'>Style as Button</label>
										<Text variant='xs/normal' className='text-gray-500'>
											Show only the checkout button without product details. Perfect for
											minimal designs or when product details are shown elsewhere.
										</Text>
									</div>
									<Switch
										checked={block.styleAsButton ?? false}
										onCheckedChange={checked =>
											updateBlock({ handle, id: blockId, styleAsButton: checked })
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</Card>
	);
}
