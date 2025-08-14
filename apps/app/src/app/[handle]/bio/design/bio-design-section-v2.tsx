'use client';

import type { BioWithButtons } from '@barely/validators';
import { useState } from 'react';
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

import { AppearanceCustomizer } from './appearance-customizer';
import { BlockStyleCustomizer } from './block-style-customizer';
import { FontSelector } from './font-selector';
import { HeaderStyleSelector } from './header-style-selector';
import { PageSettingsPanel } from './page-settings-panel';
import { ThemeCategorySelector } from './theme-category-selector';

export function BioDesignSectionV2() {
	const params = useParams();
	const handle = params.handle as string;
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState('theme');

	// Get the workspace's bio
	const { data: bio, isLoading } = useQuery({
		...trpc.bio.byHandle.queryOptions({ handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	}) as { data: BioWithButtons | undefined; isLoading: boolean };

	const formSchema = updateBioSchema.extend({ handle: z.string() });

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: bio?.id ?? '',
			handle,
			theme: bio?.theme ?? 'default',
			themeCategory: bio?.themeCategory ?? undefined,
			headerStyle: bio?.headerStyle ?? 'minimal',
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

	if (isLoading) {
		return (
			<Card className='p-6'>
				<div className='flex items-center justify-center'>
					<LoadingSpinner />
				</div>
			</Card>
		);
	}

	if (!bio) {
		return (
			<Card className='p-6'>
				<Text variant='lg/semibold'>Bio not found</Text>
				<Text variant='sm/normal' className='text-muted-foreground'>
					Unable to load bio configuration.
				</Text>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<Form form={form} onSubmit={handleSubmit}>
				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<Card className='p-2'>
						<TabsList className='grid w-full grid-cols-6'>
							<TabsTrigger value='theme'>Theme</TabsTrigger>
							<TabsTrigger value='header'>Header</TabsTrigger>
							<TabsTrigger value='appearance'>Appearance</TabsTrigger>
							<TabsTrigger value='fonts'>Fonts</TabsTrigger>
							<TabsTrigger value='blocks'>Block Style</TabsTrigger>
							<TabsTrigger value='settings'>Settings</TabsTrigger>
						</TabsList>
					</Card>

					<Card className='p-6'>
						<TabsContent value='theme' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Choose Your Theme</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Select a theme category that matches your brand personality
									</Text>
								</div>
								<ThemeCategorySelector
									value={form.watch('themeCategory')}
									onChange={category => {
										form.setValue('themeCategory', category);
									}}
								/>
							</div>
						</TabsContent>

						<TabsContent value='header' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Header Layout</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Choose how your profile information is displayed
									</Text>
								</div>
								<HeaderStyleSelector
									value={form.watch('headerStyle')}
									onChange={style => form.setValue('headerStyle', style)}
								/>
							</div>
						</TabsContent>

						<TabsContent value='appearance' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Color Scheme</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Select and customize your color palette
									</Text>
								</div>
								<AppearanceCustomizer
									appearancePreset={form.watch('appearancePreset')}
									colorScheme={form.watch('colorScheme')}
									onAppearanceChange={preset => form.setValue('appearancePreset', preset)}
									onColorSchemeChange={scheme => form.setValue('colorScheme', scheme)}
								/>
							</div>
						</TabsContent>

						<TabsContent value='fonts' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Typography</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Choose fonts that represent your style
									</Text>
								</div>
								<FontSelector
									fontPreset={form.watch('fontPreset')}
									headingFont={form.watch('headingFont')}
									bodyFont={form.watch('bodyFont')}
									onFontPresetChange={preset => form.setValue('fontPreset', preset)}
									onHeadingFontChange={font => form.setValue('headingFont', font)}
									onBodyFontChange={font => form.setValue('bodyFont', font)}
								/>
							</div>
						</TabsContent>

						<TabsContent value='blocks' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Button & Block Style</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Customize the shape and style of interactive elements
									</Text>
								</div>
								<BlockStyleCustomizer
									blockStyle={form.watch('blockStyle')}
									blockShadow={form.watch('blockShadow')}
									blockOutline={form.watch('blockOutline')}
									onBlockStyleChange={style => form.setValue('blockStyle', style)}
									onBlockShadowChange={shadow => form.setValue('blockShadow', shadow)}
									onBlockOutlineChange={outline => form.setValue('blockOutline', outline)}
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

						<div className='mt-6 flex justify-end'>
							<SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton>
						</div>
					</Card>
				</Tabs>
			</Form>
		</div>
	);
}
