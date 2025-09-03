'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { FileText, Trash2 } from 'lucide-react';
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Input } from '@barely/ui/input';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Switch } from '@barely/ui/switch';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

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
		key: 'home',
	}).queryKey;

	const blocksQueryKey = trpc.bio.blocksByHandleAndKey.queryOptions({
		handle,
		key: 'home',
	}).queryKey;

	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions(
			{
				handle,
				key: 'home',
			},
			{ staleTime: 1000 * 60 * 5 },
		),
	);

	const { data: blocks } = useSuspenseQuery(
		trpc.bio.blocksByHandleAndKey.queryOptions(
			{ handle, key: 'home' },
			{ staleTime: 1000 * 60 * 5 },
		),
	);

	const block = blocks.find(b => b.id === blockId);

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
			formSetRef.current = true;
		}
	}, [block]);

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
		updateBlock({
			handle,
			id: blockId,
			markdown,
		});
		// Both toast.success and setOriginalMarkdown are handled by the mutation's onSuccess
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
								<Button onClick={handleCancelChanges} size='sm' look='outline'>
									Cancel
								</Button>
								<Button onClick={handleSaveMarkdown} size='sm' look='primary'>
									Save Changes
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
