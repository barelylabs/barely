'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import React, { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Check, FileText, Trash2 } from 'lucide-react';
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
import { Input } from '@barely/ui/input';
import { LoadingSpinner } from '@barely/ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

// Lazy load MDXEditor to improve initial page load
const MDXEditor = dynamic(
	() => import('@barely/ui/mdx-editor').then(mod => ({ default: mod.MDXEditor })),
	{
		ssr: false,
		loading: () => (
			<div className='flex h-[400px] items-center justify-center rounded-lg border bg-gray-50'>
				<LoadingSpinner className='h-8 w-8 text-gray-400' />
			</div>
		),
	},
);

interface BioMarkdownPageProps {
	handle: string;
	blockId: string;
}

type BioBlock = AppRouterOutputs['bio']['blocksByHandleAndKey'][number];

export function BioMarkdownPage({ handle, blockId }: BioMarkdownPageProps) {
	return (
		<NavigationGuardProvider>
			<BioMarkdownPageInner handle={handle} blockId={blockId} />
		</NavigationGuardProvider>
	);
}

function BioMarkdownPageInner({ handle, blockId }: BioMarkdownPageProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const editorRef = useRef<MDXEditorMethods>(null);
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

	// Initialize state with block data or defaults
	const [markdown, setMarkdown] = useState(block?.markdown ?? '');
	const [originalMarkdown, setOriginalMarkdown] = useState(block?.markdown ?? '');
	const [blockName, setBlockName] = useState(block?.name ?? 'Markdown Block');

	// Title and subtitle state
	const [editTitle, setEditTitle] = useState(block?.title ?? '');
	const [originalTitle, setOriginalTitle] = useState(block?.title ?? '');
	const [editSubtitle, setEditSubtitle] = useState(block?.subtitle ?? '');
	const [originalSubtitle, setOriginalSubtitle] = useState(block?.subtitle ?? '');

	// CTA state variables (like two-panel page)
	const [ctaText, setCtaText] = useState(block?.ctaText ?? '');
	const [ctaType, setCtaType] = useState<'none' | 'url' | 'bio' | 'cart'>(
		block?.ctaText ?
			block.targetUrl ? 'url'
			: block.targetBioId ? 'bio'
			: block.targetCartFunnelId ? 'cart'
			: 'none'
		:	'none',
	);
	const [ctaUrl, setCtaUrl] = useState(block?.targetUrl ?? '');
	const [ctaBioId, setCtaBioId] = useState<string | null>(block?.targetBioId ?? null);
	const [ctaCartFunnelId, setCtaCartFunnelId] = useState<string | null>(
		block?.targetCartFunnelId ?? null,
	);
	const [showFunnelSelector, setShowFunnelSelector] = useState(false);
	const [showBioSelector, setShowBioSelector] = useState(false);

	// Get available bios and cart funnels for CTA
	const biosResult = useSuspenseQuery(trpc.bio.byWorkspace.queryOptions({ handle }));
	const bios = 'bios' in biosResult.data ? biosResult.data.bios : [];

	const cartFunnelsResult = useSuspenseQuery(
		trpc.cartFunnel.byWorkspace.queryOptions({ handle }),
	);
	const cartFunnels =
		'cartFunnels' in cartFunnelsResult.data ? cartFunnelsResult.data.cartFunnels : [];

	// Mutations
	const { mutate: updateBlock, isPending: isUpdating } = useMutation(
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
				// If we just saved markdown content, update the originalMarkdown
				if (
					'markdown' in variables &&
					variables.markdown !== null &&
					variables.markdown !== undefined
				) {
					setOriginalMarkdown(variables.markdown);
				}
				// Update original title if saved
				if ('title' in variables) {
					setOriginalTitle(variables.title ?? '');
				}
				// Update original subtitle if saved
				if ('subtitle' in variables) {
					setOriginalSubtitle(variables.subtitle ?? '');
				}
				toast.success('Block updated');
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
				await queryClient.invalidateQueries({ queryKey: blocksQueryKey });
			},
		}),
	);

	const { mutate: deleteBlock } = useMutation(
		trpc.bio.deleteBlock.mutationOptions({
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
				await queryClient.invalidateQueries({ queryKey: blocksQueryKey });
			},
		}),
	);

	// Handle markdown change with optimistic update for preview
	const handleMarkdownChange = useCallback(
		(newMarkdown: string) => {
			setMarkdown(newMarkdown);

			// Optimistically update the query cache for real-time preview
			// This doesn't trigger a mutation, just updates the local cache
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

	// Handle title change with optimistic update
	const handleTitleChange = useCallback(
		(newTitle: string) => {
			setEditTitle(newTitle);
			// Optimistically update cache
			queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
				if (!oldBlocks) return oldBlocks;
				return oldBlocks.map(b => {
					if (b.id !== blockId) return b;
					return { ...b, title: newTitle || null };
				});
			});
		},
		[queryClient, blocksQueryKey, blockId],
	);

	// Handle subtitle change with optimistic update
	const handleSubtitleChange = useCallback(
		(newSubtitle: string) => {
			setEditSubtitle(newSubtitle);
			// Optimistically update cache
			queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
				if (!oldBlocks) return oldBlocks;
				return oldBlocks.map(b => {
					if (b.id !== blockId) return b;
					return { ...b, subtitle: newSubtitle || null };
				});
			});
		},
		[queryClient, blocksQueryKey, blockId],
	);

	// Validation for CTA
	const isCtaIncomplete =
		ctaText &&
		ctaType !== 'none' &&
		((ctaType === 'url' && !ctaUrl) ||
			(ctaType === 'bio' && !ctaBioId) ||
			(ctaType === 'cart' && !ctaCartFunnelId));

	// Track if content has changed
	const hasUnsavedChanges = markdown !== originalMarkdown;

	// Set up navigation guard for unsaved changes
	useNavigationGuard({
		enabled: hasUnsavedChanges,
		confirm: () => {
			return window.confirm('You have unsaved changes. Are you sure you want to leave?');
		},
	});

	// Save and cancel handlers (simplified - only saves markdown now)
	const handleSaveMarkdown = () => {
		updateBlock({
			handle,
			id: blockId,
			markdown,
		});
	};

	const handleCancelChanges = () => {
		setMarkdown(originalMarkdown);
		if (editorRef.current) {
			editorRef.current.setMarkdown(originalMarkdown);
		}

		// Revert the optimistic update in the query cache
		queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
			if (!oldBlocks) return oldBlocks;
			return oldBlocks.map(b => {
				if (b.id !== blockId) return b;
				return {
					...b,
					markdown: originalMarkdown,
				};
			});
		});
	};

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this markdown block?')) {
			deleteBlock({
				handle,
				bioId: bio.id,
				blockId,
			});
		}
	};

	// const handleSaveSettings = () => {
	// 	if (!block) return;
	// 	updateBlock({
	// 		handle,
	// 		id: blockId,
	// 		title: editTitle || null,
	// 		subtitle: editSubtitle || null,
	// 	});
	// };

	// Character count
	const characterCount = markdown.length;
	const maxCharacters = 5000;
	const isOverLimit = characterCount > maxCharacters;

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
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100'>
						<FileText className='h-5 w-5 text-blue-600' />
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
							placeholder='Markdown Block'
						/>
						<div className='flex items-center gap-2'>
							<Text
								variant='sm/normal'
								className={cn('text-gray-500', isOverLimit && 'text-red-500')}
							>
								{characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}{' '}
								characters
							</Text>
						</div>
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

			{/* Content Section (no tabs for now) */}
			<div className='space-y-4'>
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
						<label className='mb-2 block text-sm font-medium'>Subtitle (optional)</label>
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

				{/* Markdown Editor */}
				<div>
					<Text variant='sm/semibold' className='mb-2'>
						Markdown Content
					</Text>
					<Text variant='xs/normal' className='mb-4 text-gray-500'>
						Write your content using markdown formatting. This will be rendered on your
						bio page.
					</Text>
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
					{/* Save/Cancel buttons for unsaved changes */}
					{hasUnsavedChanges && (
						<div className='mt-4 flex items-center justify-between'>
							<Text variant='sm/normal' className='text-amber-600'>
								You have unsaved changes
							</Text>
							<div className='flex gap-2'>
								<Button
									onClick={handleCancelChanges}
									size='sm'
									look='outline'
									disabled={isUpdating}
								>
									Cancel
								</Button>
								<Button
									onClick={handleSaveMarkdown}
									size='sm'
									look='primary'
									disabled={isUpdating || !!isCtaIncomplete}
								>
									{isUpdating ?
										<>
											<LoadingSpinner className='mr-2 h-4 w-4' />
											Saving...
										</>
									:	'Save Changes'}
								</Button>
							</div>
						</div>
					)}
					{isOverLimit && (
						<Text variant='sm/normal' className='mt-2 text-red-500'>
							Content exceeds maximum character limit of {maxCharacters.toLocaleString()}
						</Text>
					)}
				</div>

				{/* CTA Section */}
				<div className='border-t pt-4'>
					<Text variant='sm/semibold' className='mb-2'>
						Call to Action (Optional)
					</Text>
					<Text variant='xs/normal' className='mb-4 text-gray-500'>
						Add a button that appears at the bottom of your markdown content.
					</Text>

					<div className='space-y-4'>
						{/* Button Text */}
						<div>
							<Text variant='sm/normal' className='mb-1.5'>
								Button Text
							</Text>
							<Input
								value={ctaText}
								onChange={e => {
									setCtaText(e.target.value);
									// Optimistic update
									queryClient.setQueryData<BioBlock[]>(blocksQueryKey, oldBlocks => {
										if (!oldBlocks) return oldBlocks;
										return oldBlocks.map(b => {
											if (b.id !== blockId) return b;
											return { ...b, ctaText: e.target.value };
										});
									});
								}}
								onBlur={() => {
									updateBlock({
										handle,
										id: blockId,
										ctaText: ctaText || null,
									});
								}}
								placeholder='e.g., Learn More, Get Started'
							/>
						</div>

						{ctaText && (
							<>
								{/* Button Action Type */}
								<div>
									<Text variant='sm/normal' className='mb-1.5'>
										Button Action
									</Text>
									<Select
										value={ctaType}
										onValueChange={(value: 'none' | 'url' | 'bio' | 'cart') => {
											setCtaType(value);
											// Clear previous values when changing type
											if (value !== 'url') setCtaUrl('');
											if (value !== 'bio') setCtaBioId(null);
											if (value !== 'cart') setCtaCartFunnelId(null);

											// Auto-select first cart funnel if switching to cart
											if (value === 'cart' && cartFunnels.length > 0) {
												const firstFunnelId = cartFunnels[0]?.id;
												if (firstFunnelId) {
													setCtaCartFunnelId(firstFunnelId);
												}
											}

											// Save immediately
											const updateData: {
												handle: string;
												id: string;
												ctaText?: string | null;
												targetUrl?: string | null;
												targetBioId?: string | null;
												targetCartFunnelId?: string | null;
											} = {
												handle,
												id: blockId,
												ctaText,
												targetUrl: null,
												targetBioId: null,
												targetCartFunnelId: null,
											};

											// Set the appropriate target based on the new type
											switch (value) {
												case 'none':
													// Clear all targets
													break;
												case 'url':
													if (ctaUrl) updateData.targetUrl = ctaUrl;
													break;
												case 'bio':
													if (ctaBioId) updateData.targetBioId = ctaBioId;
													break;
												case 'cart': {
													// Use auto-selected or existing funnel ID
													const funnelId = ctaCartFunnelId ?? cartFunnels[0]?.id;
													if (funnelId) {
														updateData.targetCartFunnelId = funnelId;
													}
													break;
												}
											}

											updateBlock(updateData);
										}}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='none'>No Action</SelectItem>
											<SelectItem value='url'>External URL</SelectItem>
											<SelectItem value='bio'>Another Bio</SelectItem>
											<SelectItem value='cart'>Cart Funnel</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* URL Input */}
								{ctaType === 'url' && (
									<div>
										<Text variant='sm/normal' className='mb-1.5'>
											URL
										</Text>
										<Input
											value={ctaUrl}
											onChange={e => setCtaUrl(e.target.value)}
											onBlur={() => {
												updateBlock({
													handle,
													id: blockId,
													ctaText,
													targetUrl: ctaUrl || null,
													targetBioId: null,
													targetCartFunnelId: null,
												});
											}}
											type='url'
											placeholder='https://example.com'
										/>
									</div>
								)}

								{/* Bio Selector */}
								{ctaType === 'bio' && (
									<div>
										<Text variant='sm/normal' className='mb-1.5'>
											Select Bio
										</Text>
										<Popover open={showBioSelector} onOpenChange={setShowBioSelector}>
											<PopoverTrigger asChild>
												<Button
													variant='button'
													look='outline'
													role='combobox'
													aria-expanded={showBioSelector}
													className='w-full justify-between'
													startIcon={ctaBioId ? 'check' : 'search'}
													endIcon='chevronDown'
												>
													{ctaBioId ?
														(bios.find(b => b.id === ctaBioId)?.key ?? 'Select a bio')
													:	'Select a bio'}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-[250px] p-0'>
												<Command>
													<CommandInput placeholder='Search bios...' />
													<CommandEmpty>No bio found.</CommandEmpty>
													<CommandGroup>
														<CommandList>
															{bios.map(bio => (
																<CommandItem
																	key={bio.id}
																	onSelect={() => {
																		setCtaBioId(bio.id);
																		setShowBioSelector(false);
																		updateBlock({
																			handle,
																			id: blockId,
																			ctaText,
																			targetUrl: null,
																			targetBioId: bio.id,
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
																	{bio.key}
																</CommandItem>
															))}
														</CommandList>
													</CommandGroup>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
								)}

								{/* Cart Funnel Selector */}
								{ctaType === 'cart' && (
									<div>
										<Text variant='sm/normal' className='mb-1.5'>
											Select Cart Funnel
										</Text>
										<Popover
											open={showFunnelSelector}
											onOpenChange={setShowFunnelSelector}
										>
											<PopoverTrigger asChild>
												<Button
													variant='button'
													look='outline'
													role='combobox'
													aria-expanded={showFunnelSelector}
													className='w-full justify-between'
													startIcon={ctaCartFunnelId ? 'check' : 'search'}
													endIcon='chevronDown'
												>
													{ctaCartFunnelId ?
														(cartFunnels.find(cf => cf.id === ctaCartFunnelId)?.name ??
														'Select a cart funnel')
													:	'Select a cart funnel'}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-[250px] p-0'>
												<Command>
													<CommandInput placeholder='Search cart funnels...' />
													<CommandEmpty>No cart funnel found.</CommandEmpty>
													<CommandGroup>
														<CommandList>
															{cartFunnels.map(funnel => (
																<CommandItem
																	key={funnel.id}
																	onSelect={() => {
																		setCtaCartFunnelId(funnel.id);
																		setShowFunnelSelector(false);
																		updateBlock({
																			handle,
																			id: blockId,
																			ctaText,
																			targetUrl: null,
																			targetBioId: null,
																			targetCartFunnelId: funnel.id,
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
																	{funnel.name}
																</CommandItem>
															))}
														</CommandList>
													</CommandGroup>
												</Command>
											</PopoverContent>
										</Popover>
									</div>
								)}

								{/* Validation message */}
								{isCtaIncomplete && (
									<Text variant='xs/normal' className='text-red-500'>
										Please select a target for your CTA button
									</Text>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			{/* Tabs - commented out for now */}
			{/* <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='content'>
						<FileText className='mr-2 h-4 w-4' />
						Content
					</TabsTrigger>
					<TabsTrigger value='settings'>
						<Settings className='mr-2 h-4 w-4' />
						Settings
					</TabsTrigger>
				</TabsList>

				<TabsContent value='content' className='space-y-4'>
					... content tab content ...
				</TabsContent>

				<TabsContent value='settings' className='space-y-4'>
					... settings tab content ...
				</TabsContent>
			</Tabs> */}
		</Card>
	);
}
