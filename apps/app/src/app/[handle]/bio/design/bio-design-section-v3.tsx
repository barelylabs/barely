'use client';

import type { BioWithButtons } from '@barely/validators';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { updateBioSchema } from '@barely/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Card } from '@barely/ui/card';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { LoadingSpinner } from '@barely/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { HeaderStyleSelectorV2 } from './header-style-selector-v2';
import { PageSettingsPanel } from './page-settings-panel';

interface BioDesignSectionV3Props {
	bio: BioWithButtons;
	onFormDataChange?: (data: any) => void;
}

export function BioDesignSectionV3({ bio, onFormDataChange }: BioDesignSectionV3Props) {
	const params = useParams();
	const handle = params.handle as string;
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState('header');

	const formSchema = updateBioSchema.extend({ handle: z.string() });

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: bio?.id ?? '',
			handle,
			theme: bio?.theme ?? 'default',
			themeKey: bio?.themeKey ?? 'timeless',
			themeCategory: bio?.themeCategory ?? undefined,
			headerStyle: bio?.headerStyle ?? 'minimal-centered',
			appearancePreset: bio?.appearancePreset ?? undefined,
			colorScheme: bio?.colorScheme ?? undefined,
			fontPreset: bio?.fontPreset ?? 'modern.cal',
			headingFont: bio?.headingFont ?? undefined,
			bodyFont: bio?.bodyFont ?? undefined,
			blockStyle: bio?.blockStyle ?? 'rounded',
			blockShadow: bio?.blockShadow ?? false,
			blockOutline: bio?.blockOutline ?? false,
			showShareButton: bio?.showShareButton ?? false,
			showSubscribeButton: bio?.showSubscribeButton ?? false,
			barelyBranding: bio?.barelyBranding ?? true,
		},
	});

	// Watch all form values and notify parent component when they change
	React.useEffect(() => {
		const subscription = form.watch(value => {
			if (onFormDataChange) {
				onFormDataChange(value);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, onFormDataChange]);

	const updateMutation = useMutation({
		...trpc.bio.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Bio design updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update bio design');
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		updateMutation.mutate(data);
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
								<HeaderStyleSelectorV2
									value={form.watch('headerStyle')}
									onChange={style => form.setValue('headerStyle', style)}
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
									showShareButton={form.watch('showShareButton')}
									showSubscribeButton={form.watch('showSubscribeButton')}
									barelyBranding={form.watch('barelyBranding')}
									onShareButtonChange={show => form.setValue('showShareButton', show)}
									onSubscribeButtonChange={show =>
										form.setValue('showSubscribeButton', show)
									}
									onBrandingChange={show => form.setValue('barelyBranding', show)}
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
