'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import React, { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useZodForm } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { FileText, Trash2 } from 'lucide-react';
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Form } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Input } from '@barely/ui/input';
import { LoadingSpinner } from '@barely/ui/loading';
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
	// const [activeTab, setActiveTab] = useState('content');
	const [blockName, setBlockName] = useState('');
	// const [editTitle, setEditTitle] = useState('');
	// const [editSubtitle, setEditSubtitle] = useState('');
	const [markdown, setMarkdown] = useState('');
	const [originalMarkdown, setOriginalMarkdown] = useState('');
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

	// CTA form schema
	const ctaFormSchema = z.object({
		ctaText: z.string().optional(),
		ctaType: z.enum(['none', 'url', 'bio', 'cart']).default('none'),
		ctaUrl: z.string().optional(),
		ctaBioId: z.string().optional(),
		ctaCartFunnelId: z.string().optional(),
	});

	const ctaForm = useZodForm({
		schema: ctaFormSchema,
		defaultValues: {
			ctaText: '',
			ctaType: 'none',
			ctaUrl: '',
			ctaBioId: undefined,
			ctaCartFunnelId: undefined,
		},
	});

	const ctaType = ctaForm.watch('ctaType');

	// Get available bios and cart funnels for CTA
	const biosResult = useSuspenseQuery(trpc.bio.byWorkspace.queryOptions({ handle }));
	const bios = 'bios' in biosResult.data ? biosResult.data.bios : [];

	const cartFunnelsResult = useSuspenseQuery(
		trpc.cartFunnel.byWorkspace.queryOptions({ handle }),
	);
	const cartFunnels = cartFunnelsResult.data && 'cartFunnels' in cartFunnelsResult.data ? cartFunnelsResult.data.cartFunnels : [];

	// Initialize form values when block loads
	const formSetRef = useRef(false);

	React.useEffect(() => {
		if (formSetRef.current) return;
		if (block) {
			// setEditTitle(block.title ?? '');
			// setEditSubtitle(block.subtitle ?? '');
			setBlockName(block.name ?? 'Markdown Block');
			setMarkdown(block.markdown ?? '');
			setOriginalMarkdown(block.markdown ?? '');

			// Initialize CTA fields
			if (block.ctaText) {
				ctaForm.setValue('ctaText', block.ctaText);
				if (block.targetUrl) {
					ctaForm.setValue('ctaType', 'url');
					ctaForm.setValue('ctaUrl', block.targetUrl);
				} else if (block.targetBioId) {
					ctaForm.setValue('ctaType', 'bio');
					ctaForm.setValue('ctaBioId', block.targetBioId);
				} else if (block.targetCartFunnelId) {
					ctaForm.setValue('ctaType', 'cart');
					ctaForm.setValue('ctaCartFunnelId', block.targetCartFunnelId);
				}
			}

			formSetRef.current = true;
		}
	}, [block, ctaForm]);

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

	// Track if content has changed
	const hasUnsavedChanges = markdown !== originalMarkdown;

	// Set up navigation guard for unsaved changes
	useNavigationGuard({
		enabled: hasUnsavedChanges,
		confirm: () => {
			return window.confirm('You have unsaved changes. Are you sure you want to leave?');
		},
	});

	// Save and cancel handlers
	const handleSaveMarkdown = () => {
		const ctaValues = ctaForm.getValues();
		const updateData: any = {
			handle,
			id: blockId,
			markdown,
		};

		// Add CTA fields
		if (ctaValues.ctaText && ctaValues.ctaType !== 'none') {
			updateData.ctaText = ctaValues.ctaText;
			// Clear all CTA target fields first
			updateData.targetUrl = null;
			updateData.targetBioId = null;
			updateData.targetCartFunnelId = null;

			// Set the appropriate one
			switch (ctaValues.ctaType) {
				case 'url':
					updateData.targetUrl = ctaValues.ctaUrl || null;
					break;
				case 'bio':
					updateData.targetBioId = ctaValues.ctaBioId || null;
					break;
				case 'cart':
					updateData.targetCartFunnelId = ctaValues.ctaCartFunnelId || null;
					break;
			}
		} else {
			// Clear CTA if no text
			updateData.ctaText = null;
			updateData.targetUrl = null;
			updateData.targetBioId = null;
			updateData.targetCartFunnelId = null;
		}

		updateBlock(updateData);
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
					href={`/${handle}/bios/blocks?bioKey=${bioKey}`}
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
									disabled={isUpdating}
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

					<Form form={ctaForm} onSubmit={() => {}}>
						<div className='space-y-4'>
							<TextField
								control={ctaForm.control}
								name='ctaText'
								label='Button Text'
								placeholder='e.g., Learn More, Get Started'
							/>

							{ctaForm.watch('ctaText') && (
								<>
									<SelectField
										control={ctaForm.control}
										name='ctaType'
										label='Button Action'
										options={[
											{ value: 'none', label: 'No Action' },
											{ value: 'url', label: 'External URL' },
											{ value: 'bio', label: 'Another Bio' },
											{ value: 'cart', label: 'Cart Funnel' },
										]}
									/>

									{ctaType === 'url' && (
										<TextField
											control={ctaForm.control}
											name='ctaUrl'
											label='URL'
											type='url'
											placeholder='https://example.com'
										/>
									)}

									{ctaType === 'bio' && (
										<SelectField
											control={ctaForm.control}
											name='ctaBioId'
											label='Select Bio'
											options={
												bios.map(b => ({
													value: b.id,
													label: b.name,
												}))
											}
											placeholder='Choose a bio'
										/>
									)}

									{ctaType === 'cart' && (
										<SelectField
											control={ctaForm.control}
											name='ctaCartFunnelId'
											label='Select Cart Funnel'
											options={
												cartFunnels.map(cf => ({
													value: cf.id,
													label: cf.name,
												}))
											}
											placeholder='Choose a cart funnel'
										/>
									)}
								</>
							)}
						</div>
					</Form>
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
