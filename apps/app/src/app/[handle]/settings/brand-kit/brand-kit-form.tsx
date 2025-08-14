'use client';

import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import type { BrandKit } from '@barely/validators';
import type { z } from 'zod/v4';
import React, { useRef, useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { updateBrandKitSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Card } from '@barely/ui/card';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

// Import design components from bio
import { AppearanceCustomizerV2 } from '../../bio/design/appearance-customizer-v2';
import { BlockStyleCustomizer } from '../../bio/design/block-style-customizer';
import { FontSelector } from '../../bio/design/font-selector';

interface BrandKitFormProps {
	brandKit: BrandKit;
	onFormDataChange?: (data: any) => void;
}

export function BrandKitForm({ brandKit, onFormDataChange }: BrandKitFormProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();
	const [activeTab, setActiveTab] = useState('content');
	const mdxEditorRef = useRef<MDXEditorMethods>(null);

	const formSchema = updateBrandKitSchema;

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: brandKit.id,
			longBio: brandKit.longBio ?? '',
			shortBio: brandKit.shortBio ?? '',
			appearancePreset: brandKit.appearancePreset ?? undefined,
			colorScheme: brandKit.colorScheme ?? undefined,
			fontPreset: brandKit.fontPreset ?? 'modern.cal',
			headingFont: brandKit.headingFont ?? undefined,
			bodyFont: brandKit.bodyFont ?? undefined,
			blockStyle: brandKit.blockStyle ?? 'rounded',
			blockShadow: brandKit.blockShadow ?? false,
			blockOutline: brandKit.blockOutline ?? false,
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
		...trpc.brandKit.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Brand kit updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey(),
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update brand kit');
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
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='content'>Content</TabsTrigger>
							<TabsTrigger value='appearance'>Colors</TabsTrigger>
							<TabsTrigger value='fonts'>Fonts</TabsTrigger>
							<TabsTrigger value='blocks'>Buttons</TabsTrigger>
						</TabsList>
					</Card>

					<Card className='p-6'>
						<TabsContent value='content' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Brand Content</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Your brand story and descriptions
									</Text>
								</div>

								<TextAreaField
									control={form.control}
									name='shortBio'
									label='Short Bio'
									placeholder='A brief description for social media and quick introductions.'
									rows={3}
								/>

								<div className='space-y-2'>
									<label className='text-sm font-medium'>Long Bio</label>
									<div className='w-full'>
										<MDXEditor
											ref={mdxEditorRef}
											markdown={form.watch('longBio') ?? ''}
											onChange={v => {
												form.setValue('longBio', v, { shouldDirty: true });
											}}
											className='w-full'
											toolbarOptions={{
												undoRedo: true,
												headings: true,
												lists: false,
												formatting: true,
												divs: false,
												links: false,
												barely: false,
											}}
										/>
									</div>
									<p className='text-xs text-muted-foreground'>
										Tell your full story... This appears on your press kit and about
										pages.
									</p>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='appearance' className='space-y-6'>
							<div className='space-y-4'>
								<div>
									<Text variant='lg/semibold'>Color Scheme</Text>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Select and customize your brand colors
									</Text>
								</div>
								<AppearanceCustomizerV2
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
										Choose fonts that represent your brand
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
					</Card>
				</Tabs>

				{/* Save Changes button outside of tabs */}
				<div className='flex justify-end'>
					<SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton>
				</div>
			</Form>
		</div>
	);
}
