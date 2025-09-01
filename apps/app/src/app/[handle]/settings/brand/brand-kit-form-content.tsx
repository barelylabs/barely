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

import { useBrandKit } from '~/hooks/use-brand-kit';
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

	const { updateBrandKitPreview } = useBrandKit();

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
							onChange={async v => {
								await updateBrandKitPreview({
									shortBio: v.target.value,
								});
							}}
						/>

						<TextField
							control={form.control}
							name='location'
							label='Location'
							placeholder='Brooklyn, NY'
							startIcon='mapPin'
							onChange={async v => {
								await updateBrandKitPreview({
									location: v.target.value,
								});
							}}
						/>

						<div className='space-y-2'>
							<label className='text-sm font-medium'>Long Bio</label>
							<div className='w-full'>
								<MDXEditor
									ref={mdxEditorRef}
									markdown={form.watch('longBio') ?? ''}
									onChange={async v => {
										form.setValue('longBio', v, { shouldDirty: true });
										await updateBrandKitPreview({ longBio: v });
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
							color1={form.watch('color1')}
							color2={form.watch('color2')}
							color3={form.watch('color3')}
							bioColorScheme={form.watch('bioColorScheme')}
							cartColorScheme={form.watch('cartColorScheme')}
							onColorPresetChange={async preset => {
								form.setValue('colorPreset', preset, { shouldDirty: true });
								await updateBrandKitPreview({
									colorPreset: preset,
								});
							}}
							onBioColorSchemeChange={async bioScheme => {
								// ONLY update bio color scheme
								form.setValue('bioColorScheme', bioScheme, { shouldDirty: true });
								await updateBrandKitPreview({
									bioColorScheme: bioScheme,
								});
							}}
							onCartColorSchemeChange={async cartScheme => {
								// ONLY update cart color scheme
								form.setValue('cartColorScheme', cartScheme, { shouldDirty: true });
								await updateBrandKitPreview({
									cartColorScheme: cartScheme,
								});
							}}
							onColorsChange={async colors => {
								// Update the three base colors
								form.setValue('color1', colors[0], { shouldDirty: true });
								form.setValue('color2', colors[1], { shouldDirty: true });
								form.setValue('color3', colors[2], { shouldDirty: true });
								await updateBrandKitPreview({
									color1: colors[0],
									color2: colors[1],
									color3: colors[2],
								});
							}}
							onColorSchemeChange={async scheme => {
								// Update legacy colorScheme for backwards compatibility
								form.setValue('colorScheme', scheme, {
									shouldDirty: true,
									shouldValidate: true,
								});

								// Extract colors from the scheme
								form.setValue('color1', scheme.colors[0], { shouldDirty: true });
								form.setValue('color2', scheme.colors[1], { shouldDirty: true });
								form.setValue('color3', scheme.colors[2], { shouldDirty: true });

								// Update bio color scheme based on the mapping
								form.setValue(
									'bioColorScheme',
									{
										bgColor: scheme.mapping.backgroundColor,
										textColor: scheme.mapping.textColor,
										blockColor: scheme.mapping.blockColor,
										blockTextColor: scheme.mapping.blockTextColor,
										bannerColor: scheme.mapping.bannerColor,
									},
									{ shouldDirty: true },
								);

								// Update cart color scheme (cart doesn't have banner)
								form.setValue(
									'cartColorScheme',
									{
										bgColor: scheme.mapping.backgroundColor,
										textColor: scheme.mapping.textColor,
										blockColor: scheme.mapping.buttonColor, // Use button color for cart CTAs
										blockTextColor: scheme.mapping.buttonTextColor,
									},
									{ shouldDirty: true },
								);

								await updateBrandKitPreview({
									colorScheme: scheme,
									color1: scheme.colors[0],
									color2: scheme.colors[1],
									color3: scheme.colors[2],
									bioColorScheme: {
										bgColor: scheme.mapping.backgroundColor,
										textColor: scheme.mapping.textColor,
										blockColor: scheme.mapping.blockColor,
										blockTextColor: scheme.mapping.blockTextColor,
										bannerColor: scheme.mapping.bannerColor,
									},
									cartColorScheme: {
										bgColor: scheme.mapping.backgroundColor,
										textColor: scheme.mapping.textColor,
										blockColor: scheme.mapping.buttonColor,
										blockTextColor: scheme.mapping.buttonTextColor,
									},
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
							onFontPresetChange={async preset => {
								form.setValue('fontPreset', preset, { shouldDirty: true });
								await updateBrandKitPreview({ fontPreset: preset });
							}}
							onHeadingFontChange={async font => {
								form.setValue('headingFont', font, { shouldDirty: true });
								await updateBrandKitPreview({ headingFont: font });
							}}
							onBodyFontChange={async font => {
								form.setValue('bodyFont', font, { shouldDirty: true });
								await updateBrandKitPreview({ bodyFont: font });
							}}
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
							onBlockStyleChange={async style => {
								form.setValue('blockStyle', style, { shouldDirty: true });
								await updateBrandKitPreview({ blockStyle: style });
							}}
							onBlockShadowChange={async shadow => {
								form.setValue('blockShadow', shadow, { shouldDirty: true });
								await updateBrandKitPreview({ blockShadow: shadow });
							}}
							onBlockOutlineChange={async outline => {
								form.setValue('blockOutline', outline, { shouldDirty: true });
								await updateBrandKitPreview({ blockOutline: outline });
							}}
						/>
					</div>
				</TabsContent>
			</Card>
		</Tabs>
	);
}
