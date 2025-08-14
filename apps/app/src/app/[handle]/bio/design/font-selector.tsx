'use client';

import type { FontPreset } from '@barely/lib/functions/bio-themes-v2';
import { useState } from 'react';
import { FONT_PRESETS } from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

interface FontSelectorProps {
	fontPreset: FontPreset | undefined | null;
	headingFont?: string | null;
	bodyFont?: string | null;
	onFontPresetChange: (preset: FontPreset) => void;
	onHeadingFontChange: (font: string) => void;
	onBodyFontChange: (font: string) => void;
}

const FONT_CATEGORIES = {
	modern: {
		label: 'Modern',
		presets: [
			'modern.cal',
			'modern.montserrat',
			'modern.bowlbyOne',
			'modern.anton',
		] as FontPreset[],
	},
	classic: {
		label: 'Classic',
		presets: [
			'classic.playfairDisplay',
			'classic.playfairDisplaySc',
			'classic.cutive',
			'classic.libreBaskerville',
		] as FontPreset[],
	},
	creative: {
		label: 'Creative',
		presets: [
			'creative.fredokaOne',
			'creative.yellowtail',
			'creative.permanentMarker',
			'creative.pacifico',
		] as FontPreset[],
	},
	logo: {
		label: 'Logo',
		presets: [
			'logo.coda',
			'logo.miriamLibre',
			'logo.rammettoOne',
			'logo.gravitasOne',
		] as FontPreset[],
	},
	futuristic: {
		label: 'Futuristic',
		presets: [
			'futuristic.museoModerno',
			'futuristic.audiowide',
			'futuristic.lexendZetta',
			'futuristic.unicaOne',
		] as FontPreset[],
	},
};

export function FontSelector({
	fontPreset = 'modern.cal',
	headingFont,
	bodyFont,
	onFontPresetChange,
	onHeadingFontChange,
	onBodyFontChange,
}: FontSelectorProps) {
	// Determine which tab should be active based on current font preset
	const activePreset = fontPreset ?? 'modern.cal';
	const getActiveTab = () => {
		const category = Object.entries(FONT_CATEGORIES).find(([_, cat]) =>
			cat.presets.includes(activePreset),
		);
		return category?.[0] ?? 'modern';
	};

	const [activeTab, setActiveTab] = useState(getActiveTab());

	const handlePresetSelect = (preset: FontPreset) => {
		onFontPresetChange(preset);
		const config = FONT_PRESETS[preset];
		if (config) {
			onHeadingFontChange(config.headingFont);
			onBodyFontChange(config.bodyFont);
		}
	};

	const FontPresetCard = ({ preset }: { preset: FontPreset }) => {
		const config = FONT_PRESETS[preset];
		if (!config) return null;

		const isSelected = activePreset === preset;

		return (
			<button
				key={preset}
				type='button'
				onClick={() => handlePresetSelect(preset)}
				className={cn(
					'relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md',
					isSelected && 'border-brand ring-2 ring-brand/20',
					!isSelected && 'border-border hover:border-muted-foreground',
				)}
			>
				{/* Preview */}
				<div className='space-y-2'>
					<div className='text-2xl font-bold' style={{ fontFamily: config.headingFont }}>
						Heading
					</div>
					<div className='text-sm' style={{ fontFamily: config.bodyFont }}>
						Paragraph
					</div>
				</div>
			</button>
		);
	};

	return (
		<div className='space-y-6'>
			<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
				<TabsList className='grid w-full grid-cols-5'>
					{Object.entries(FONT_CATEGORIES).map(([key, category]) => (
						<TabsTrigger key={key} value={key}>
							{category.label}
						</TabsTrigger>
					))}
				</TabsList>

				{Object.entries(FONT_CATEGORIES).map(([key, category]) => (
					<TabsContent key={key} value={key} className='mt-6'>
						<div className='grid gap-4 sm:grid-cols-2'>
							{category.presets.map(preset => (
								<FontPresetCard key={preset} preset={preset} />
							))}
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
