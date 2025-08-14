'use client';

import type { AppearancePreset, ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import { useState } from 'react';
import {
	APPEARANCE_PRESETS,
	getAppearancesByType,
	shuffleColorMapping,
} from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

interface AppearanceCustomizerProps {
	appearancePreset?: string | null;
	colorScheme?: string | null;
	onAppearanceChange: (preset: string) => void;
	onColorSchemeChange: (scheme: string) => void;
}

export function AppearanceCustomizer({
	appearancePreset,
	colorScheme,
	onAppearanceChange,
	onColorSchemeChange,
}: AppearanceCustomizerProps) {
	const [activeTab, setActiveTab] = useState<AppearancePreset['type']>('neutral');

	// Parse color scheme from JSON string
	const currentScheme: ColorScheme | null =
		colorScheme ?
			(() => {
				try {
					return JSON.parse(colorScheme) as ColorScheme;
				} catch {
					return null;
				}
			})()
		:	null;

	const handlePresetSelect = (presetKey: string) => {
		const preset = APPEARANCE_PRESETS[presetKey];
		if (preset) {
			onAppearanceChange(presetKey);
			onColorSchemeChange(JSON.stringify(preset.colorScheme));
		}
	};

	const handleShuffle = () => {
		if (currentScheme) {
			const shuffled = shuffleColorMapping(currentScheme);
			onColorSchemeChange(JSON.stringify(shuffled));
		}
	};

	const renderColorPreview = (scheme: ColorScheme, isSelected: boolean) => {
		const { colors, mapping } = scheme;

		return (
			<div className='space-y-2'>
				{/* Color swatches */}
				<div className='flex justify-center gap-1'>
					{colors.map((color, idx) => (
						<div
							key={idx}
							className='h-8 w-8 rounded-full border-2 border-white shadow-sm'
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				{/* Preview elements */}
				<div className='space-y-1 px-2'>
					<div
						className='h-2 w-full rounded'
						style={{ backgroundColor: colors[mapping.textColor] }}
					/>
					<div
						className='h-6 w-full rounded-full border'
						style={{
							backgroundColor: colors[mapping.buttonColor],
							borderColor: colors[mapping.buttonColor],
						}}
					>
						<div
							className='flex h-full items-center justify-center text-xs font-medium'
							style={{ color: colors[mapping.buttonTextColor] }}
						>
							Button
						</div>
					</div>
				</div>

				{isSelected && (
					<div className='absolute right-2 top-2'>
						<Icon.checkCircle className='h-4 w-4 text-brand' />
					</div>
				)}
			</div>
		);
	};

	return (
		<div className='space-y-4'>
			<Tabs
				value={activeTab}
				onValueChange={val => setActiveTab(val as AppearancePreset['type'])}
			>
				<TabsList className='grid w-full grid-cols-5'>
					<TabsTrigger value='neutral'>Neutral</TabsTrigger>
					<TabsTrigger value='bold'>Bold</TabsTrigger>
					<TabsTrigger value='playful'>Playful</TabsTrigger>
					<TabsTrigger value='brand-kit'>Brand Kit</TabsTrigger>
					<TabsTrigger value='custom'>Custom</TabsTrigger>
				</TabsList>

				<TabsContent value='neutral' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('neutral').map(preset => (
							<button
								key={preset.key}
								type='button'
								onClick={() => handlePresetSelect(preset.key)}
								className={cn(
									'relative rounded-lg border-2 p-4 transition-all hover:shadow-md',
									appearancePreset === preset.key && 'border-brand ring-2 ring-brand/20',
									appearancePreset !== preset.key &&
										'border-border hover:border-muted-foreground',
								)}
							>
								<Text variant='sm/semibold' className='mb-2'>
									{preset.name}
								</Text>
								{renderColorPreview(preset.colorScheme, appearancePreset === preset.key)}
							</button>
						))}
					</div>
				</TabsContent>

				<TabsContent value='bold' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('bold').map(preset => (
							<button
								key={preset.key}
								type='button'
								onClick={() => handlePresetSelect(preset.key)}
								className={cn(
									'relative rounded-lg border-2 p-4 transition-all hover:shadow-md',
									appearancePreset === preset.key && 'border-brand ring-2 ring-brand/20',
									appearancePreset !== preset.key &&
										'border-border hover:border-muted-foreground',
								)}
							>
								<Text variant='sm/semibold' className='mb-2'>
									{preset.name}
								</Text>
								{renderColorPreview(preset.colorScheme, appearancePreset === preset.key)}
							</button>
						))}
					</div>
				</TabsContent>

				<TabsContent value='playful' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('playful').map(preset => (
							<button
								key={preset.key}
								type='button'
								onClick={() => handlePresetSelect(preset.key)}
								className={cn(
									'relative rounded-lg border-2 p-4 transition-all hover:shadow-md',
									appearancePreset === preset.key && 'border-brand ring-2 ring-brand/20',
									appearancePreset !== preset.key &&
										'border-border hover:border-muted-foreground',
								)}
							>
								<Text variant='sm/semibold' className='mb-2'>
									{preset.name}
								</Text>
								{renderColorPreview(preset.colorScheme, appearancePreset === preset.key)}
							</button>
						))}
					</div>
				</TabsContent>

				<TabsContent value='brand-kit' className='mt-4'>
					<div className='rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center'>
						<Icon.palette className='mx-auto mb-3 h-12 w-12 text-muted-foreground/50' />
						<p className='text-sm text-muted-foreground'>
							Brand Kit integration coming soon
						</p>
						<p className='mt-1 text-xs text-muted-foreground'>
							Import your brand colors and create custom palettes
						</p>
					</div>
				</TabsContent>

				<TabsContent value='custom' className='mt-4'>
					<div className='rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center'>
						<Icon.settings className='mx-auto mb-3 h-12 w-12 text-muted-foreground/50' />
						<p className='text-sm text-muted-foreground'>
							Custom color picker coming soon
						</p>
						<p className='mt-1 text-xs text-muted-foreground'>
							Choose your own colors and create unique combinations
						</p>
					</div>
				</TabsContent>
			</Tabs>

			{/* Shuffle button for selected preset */}
			{currentScheme && appearancePreset && (
				<div className='flex items-center justify-between rounded-lg border p-4'>
					<div>
						<Text variant='sm/semibold'>Shuffle Colors</Text>
						<Text variant='xs/normal' className='text-muted-foreground'>
							Randomize how colors map to elements
						</Text>
					</div>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleShuffle}
						className='gap-2'
					>
						<Icon.shuffle className='h-4 w-4' />
						Shuffle
					</Button>
				</div>
			)}
		</div>
	);
}
