'use client';

import type { BioWithButtons } from '@barely/validators';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';

import { BioButtonList } from './bio-button-list';
import { BioEmailSettings } from './bio-email-settings';
import { BioForm } from './bio-form';
import { BioPreview } from './bio-preview';

interface BioEditorProps {
	handle: string;
}

export function BioEditor({ handle }: BioEditorProps) {
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState('edit');

	// Get the workspace's bio (or create one if it doesn't exist)
	const { data: bio, isLoading } = useQuery({
		...trpc.bio.byHandle.queryOptions({ handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	}) as { data: BioWithButtons | undefined; isLoading: boolean };

	if (isLoading) {
		return (
			<div className='flex min-h-[400px] items-center justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	if (!bio) {
		return (
			<div className='flex min-h-[400px] flex-col items-center justify-center gap-4'>
				<Icon.warning className='h-12 w-12 text-muted-foreground' />
				<p className='text-muted-foreground'>
					Unable to load bio. Please try refreshing the page.
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6'>
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className='grid w-full max-w-md grid-cols-3'>
					<TabsTrigger value='edit'>
						<Icon.edit className='mr-2 h-4 w-4' />
						Edit
					</TabsTrigger>
					<TabsTrigger value='buttons'>
						<Icon.link className='mr-2 h-4 w-4' />
						Buttons
					</TabsTrigger>
					<TabsTrigger value='preview'>
						<Icon.view className='mr-2 h-4 w-4' />
						Preview
					</TabsTrigger>
				</TabsList>

				<TabsContent value='edit' className='mt-6'>
					<div className='grid gap-6 lg:grid-cols-2'>
						<div className='space-y-6'>
							<BioForm bio={bio} handle={handle} />
							<BioEmailSettings bio={bio} handle={handle} />
						</div>
						<div className='hidden lg:block'>
							<div className='sticky top-4'>
								<h3 className='mb-4 text-lg font-semibold'>Live Preview</h3>
								<BioPreview bio={bio} />
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='buttons' className='mt-6'>
					<div className='grid gap-6 lg:grid-cols-2'>
						<BioButtonList
							bioId={bio.id}
							handle={handle}
							buttons={bio.buttons}
							editable={true}
						/>
						<div className='hidden lg:block'>
							<div className='sticky top-4'>
								<h3 className='mb-4 text-lg font-semibold'>Live Preview</h3>
								<BioPreview bio={bio} />
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='preview' className='mt-6'>
					<div className='mx-auto max-w-md'>
						<BioPreview bio={bio} className='w-full' />
					</div>
				</TabsContent>
			</Tabs>

			{/* Public URL */}
			<div className='rounded-lg border bg-muted/50 p-4'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm font-medium'>Public Bio URL</p>
						<a
							href={`https://barely.bio/${bio.handle}`}
							target='_blank'
							rel='noopener noreferrer'
							className='text-sm text-muted-foreground hover:underline'
						>
							barely.bio/{bio.handle}
						</a>
					</div>
					<a
						href={`https://barely.bio/${bio.handle}`}
						target='_blank'
						rel='noopener noreferrer'
						className='text-sm text-primary hover:underline'
					>
						Visit Bio →
					</a>
				</div>
			</div>
		</div>
	);
}
