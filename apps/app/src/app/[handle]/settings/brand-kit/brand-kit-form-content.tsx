'use client';

import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import type { UpdateBrandKit } from '@barely/validators';
import type { UseFormReturn } from 'react-hook-form';
import React, { useState } from 'react';

import { Card } from '@barely/ui/card';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { BlockStyleCustomizer } from '../../bio/design/block-style-customizer';
// Import design components from bio
import { ColorCustomizer } from '../../bio/design/color-customizer';
import { FontSelector } from '../../bio/design/font-selector';

interface BrandKitFormContentProps {
	form: UseFormReturn<UpdateBrandKit>;
	mdxEditorRef: React.RefObject<MDXEditorMethods>;
}

export function BrandKitFormContent({ form, mdxEditorRef }: BrandKitFormContentProps) {
	const [activeTab, setActiveTab] = useState('content');

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
			<TabsList className='grid w-full grid-cols-4'>
				<TabsTrigger value='content'>Content</TabsTrigger>
				<TabsTrigger value='appearance'>Colors</TabsTrigger>
				<TabsTrigger value='fonts'>Fonts</TabsTrigger>
				<TabsTrigger value='blocks'>Buttons</TabsTrigger>
			</TabsList>

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

						<TextField
							control={form.control}
							name='location'
							label='Location'
							placeholder='Brooklyn, NY'
							startIcon='mapPin'
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
								Tell your full story... This appears on your press kit and about pages.
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
						<ColorCustomizer
							colorPreset={form.watch('colorPreset')}
							colorScheme={form.watch('colorScheme')}
							onColorPresetChange={preset =>
								form.setValue('colorPreset', preset, { shouldDirty: true })
							}
							onColorSchemeChange={scheme => {
								form.setValue('colorScheme', scheme, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
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
							onFontPresetChange={preset =>
								form.setValue('fontPreset', preset, { shouldDirty: true })
							}
							onHeadingFontChange={font =>
								form.setValue('headingFont', font, { shouldDirty: true })
							}
							onBodyFontChange={font =>
								form.setValue('bodyFont', font, { shouldDirty: true })
							}
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
							blockStyle={form.watch('blockStyle') ?? 'rounded'}
							blockShadow={form.watch('blockShadow') ?? false}
							blockOutline={form.watch('blockOutline') ?? false}
							onBlockStyleChange={style =>
								form.setValue('blockStyle', style, { shouldDirty: true })
							}
							onBlockShadowChange={shadow =>
								form.setValue('blockShadow', shadow, { shouldDirty: true })
							}
							onBlockOutlineChange={outline =>
								form.setValue('blockOutline', outline, { shouldDirty: true })
							}
						/>
					</div>
				</TabsContent>
			</Card>
		</Tabs>
	);
}
