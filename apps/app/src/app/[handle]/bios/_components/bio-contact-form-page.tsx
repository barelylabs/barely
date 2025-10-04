'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Mail, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Input } from '@barely/ui/input';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Textarea } from '@barely/ui/textarea';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

export function BioContactFormPage({ blockId }: { blockId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const [activeTab, setActiveTab] = useState('settings');
	const [editTitle, setEditTitle] = useState('');
	const [editSubtitle, setEditSubtitle] = useState('');
	const [blockName, setBlockName] = useState('');
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
			setBlockName(block.name ?? 'Contact Form');
		}
	}, [block]);

	// Mutations
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

	const handleDeleteBlock = () => {
		if (confirm('Are you sure you want to delete this contact form block?')) {
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
		toast.success('Settings saved');
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
					{/* Blue icon like in bio-blocks-page */}
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100'>
						<Mail className='h-5 w-5 text-blue-600' />
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
							placeholder='Contact Form'
						/>
						<Text variant='sm/normal' className='text-gray-500'>
							Capture emails from your visitors
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
				<TabsList className='grid w-full grid-cols-1'>
					<TabsTrigger value='settings'>
						<Settings className='mr-2 h-4 w-4' />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Settings Tab */}
				<TabsContent value='settings' className='space-y-4'>
					<div className='space-y-6'>
						<div>
							<Text variant='lg/semibold' className='mb-2'>
								Contact Form Settings
							</Text>
							<Text variant='sm/normal' className='mb-4 text-gray-500'>
								Customize the title and subtitle that appear above your contact form.
							</Text>
							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm font-medium'>Title</label>
									<Input
										value={editTitle}
										onChange={e => setEditTitle(e.target.value)}
										placeholder='Get in touch'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm font-medium'>Subtitle</label>
									<Textarea
										value={editSubtitle}
										onChange={e => setEditSubtitle(e.target.value)}
										placeholder="I'd love to hear from you! Drop me a message below."
										rows={3}
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
