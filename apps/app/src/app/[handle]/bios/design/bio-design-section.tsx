'use client';

import type { z } from 'zod/v4';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { updateBioSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Card } from '@barely/ui/card';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { HeaderStyleSelector } from './header-style-selector';
import { PageSettingsPanel } from './page-settings-panel';

export function BioDesignSection() {
	const params = useParams();
	const handle = params.handle as string;
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState('header');

	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions(
			{ handle },
			{
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		),
	);

	const form = useZodForm({
		schema: updateBioSchema,
		defaultValues: {
			id: bio.id,
			handle,
			headerStyle: bio.headerStyle,
			showShareButton: bio.showShareButton,
			showSubscribeButton: bio.showSubscribeButton,
			barelyBranding: bio.barelyBranding,
		},
	});

	const updateMutation = useMutation(
		trpc.bio.update.mutationOptions({
			onSuccess: () => {
				toast.success('Bio design updated successfully');
			},
			onError: error => {
				toast.error(error.message);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.bio.byKey.queryKey({ handle }),
				});
			},
		}),
	);

	const handleSubmit = (data: z.infer<typeof updateBioSchema>) => {
		updateMutation.mutate({
			...data,
			handle,
		});
	};

	const handleOptimisticUpdate = (data: Omit<z.infer<typeof updateBioSchema>, 'id'>) => {
		const queryKey = trpc.bio.byKey.queryKey({ handle });
		const previousData = queryClient.getQueryData(queryKey);
		if (!previousData) return;
		queryClient.setQueryData(queryKey, {
			...previousData,
			...data,
		});
	};

	return (
		<div className='space-y-6'>
			<Form form={form} onSubmit={handleSubmit}>
				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<Card className='p-2'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='header'>Header</TabsTrigger>
							<TabsTrigger value='settings'>Settings</TabsTrigger>
						</TabsList>
					</Card>

					<Card className='p-6'>
						<TabsContent value='header' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Header Layout</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Choose how your profile information is displayed
									</Text>
								</div>
								<HeaderStyleSelector
									value={form.watch('headerStyle') ?? 'minimal-centered'}
									onChange={style => {
										form.setValue('headerStyle', style);
										handleOptimisticUpdate({
											headerStyle: style,
										});
									}}
								/>
							</div>
						</TabsContent>

						<TabsContent value='settings' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Page Settings</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Configure additional page features and branding
									</Text>
								</div>
								<PageSettingsPanel
									showShareButton={form.watch('showShareButton') ?? false}
									showSubscribeButton={form.watch('showSubscribeButton') ?? false}
									barelyBranding={form.watch('barelyBranding') ?? true}
									onShareButtonChange={show => {
										form.setValue('showShareButton', show);
										handleOptimisticUpdate({
											showShareButton: show,
										});
									}}
									onSubscribeButtonChange={show => {
										form.setValue('showSubscribeButton', show);
										handleOptimisticUpdate({
											showSubscribeButton: show,
										});
									}}
									onBrandingChange={show => {
										form.setValue('barelyBranding', show);
										handleOptimisticUpdate({
											barelyBranding: show,
										});
									}}
								/>
							</div>
						</TabsContent>
					</Card>
				</Tabs>

				{/* Save Changes button moved outside of tabs */}
				<div className='flex justify-end'>
					<SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton>
				</div>
			</Form>
		</div>
	);
}
