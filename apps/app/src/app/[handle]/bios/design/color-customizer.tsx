'use client';

import type { BrandKitColorPreset, BrandKitColorPresetKey } from '@barely/const';
import type { ColorScheme } from '@barely/validators';
import { useEffect, useState } from 'react';
import { BRAND_KIT_COLOR_PRESETS } from '@barely/const';
import {
	cn,
	getAppearancesByType,
	shuffleBioColorMapping,
	shuffleCartColorMapping,
} from '@barely/utils';
import { converter, formatHex } from 'culori';
import { HexColorPicker } from 'react-colorful';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

interface ColorCustomizerProps {
	colorPreset?: string | null;
	colorScheme?: ColorScheme | string | null;
	color1?: string | null;
	color2?: string | null;
	color3?: string | null;
	bioColorScheme?: {
		bgColor: 0 | 1 | 2;
		textColor: 0 | 1 | 2;
		blockColor: 0 | 1 | 2;
		blockTextColor: 0 | 1 | 2;
		bannerColor: 0 | 1 | 2;
	} | null;
	cartColorScheme?: {
		bgColor: 0 | 1 | 2;
		textColor: 0 | 1 | 2;
		blockColor: 0 | 1 | 2;
		blockTextColor: 0 | 1 | 2;
	} | null;
	onColorPresetChange: (preset: string) => void;
	onColorSchemeChange: (scheme: ColorScheme) => void;
	onColorsChange?: (colors: [string, string, string]) => void;
	onBioColorSchemeChange?: (bioScheme: {
		bgColor: 0 | 1 | 2;
		textColor: 0 | 1 | 2;
		blockColor: 0 | 1 | 2;
		blockTextColor: 0 | 1 | 2;
		bannerColor: 0 | 1 | 2;
	}) => void;
	onCartColorSchemeChange?: (cartScheme: {
		bgColor: 0 | 1 | 2;
		textColor: 0 | 1 | 2;
		blockColor: 0 | 1 | 2;
		blockTextColor: 0 | 1 | 2;
	}) => void;
}

export function ColorCustomizer({
	colorPreset,
	colorScheme,
	color1,
	color2,
	color3,
	onColorPresetChange,
	onColorSchemeChange,
	onColorsChange,
	onBioColorSchemeChange,
	onCartColorSchemeChange,
}: ColorCustomizerProps) {
	// Determine active tab based on current preset
	const [activeTab, setActiveTab] = useState<BrandKitColorPreset['type']>(() => {
		if (colorPreset === 'custom') {
			return 'custom';
		}
		if (colorPreset && colorPreset in BRAND_KIT_COLOR_PRESETS) {
			const preset = BRAND_KIT_COLOR_PRESETS[colorPreset as BrandKitColorPresetKey];
			return preset.type;
		}
		return 'neutral';
	});

	// Update active tab when appearancePreset changes
	useEffect(() => {
		if (colorPreset === 'custom') {
			setActiveTab('custom');
		} else if (colorPreset && colorPreset in BRAND_KIT_COLOR_PRESETS) {
			const preset = BRAND_KIT_COLOR_PRESETS[colorPreset as BrandKitColorPresetKey];
			setActiveTab(preset.type);
		}
	}, [colorPreset]);

	// Parse color scheme from JSON string or use object directly
	const currentScheme: ColorScheme | null =
		colorScheme ?
			typeof colorScheme === 'string' ?
				(() => {
					try {
						return JSON.parse(colorScheme) as ColorScheme;
					} catch {
						return null;
					}
				})()
			:	colorScheme
		:	null;

	const handlePresetSelect = (presetKey: keyof typeof BRAND_KIT_COLOR_PRESETS) => {
		if (presetKey in BRAND_KIT_COLOR_PRESETS) {
			const preset = BRAND_KIT_COLOR_PRESETS[presetKey];

			// If clicking the already selected preset, shuffle both bio and cart mappings
			if (colorPreset === presetKey) {
				// Shuffle bio mapping
				const newBioMapping = shuffleBioColorMapping();
				// Shuffle cart mapping
				const newCartMapping = shuffleCartColorMapping();

				// Create scheme with shuffled mappings but same colors
				const fullScheme: ColorScheme = {
					colors: preset.colors,
					mapping: {
						// Combine both shuffled mappings
						backgroundColor: newBioMapping.bgColor,
						textColor: newBioMapping.textColor,
						buttonColor: newCartMapping.blockColor, // Cart's blockColor maps to buttonColor
						buttonTextColor: newCartMapping.blockTextColor,
						buttonOutlineColor: newBioMapping.textColor,
						blockColor: newBioMapping.blockColor,
						blockTextColor: newBioMapping.blockTextColor,
						bannerColor: newBioMapping.bannerColor,
					},
				};
				onColorSchemeChange(fullScheme);
			} else {
				// Otherwise, select the preset with its default mappings
				onColorPresetChange(presetKey);

				// Create a ColorScheme that includes BOTH bio and cart mappings from the preset
				const fullScheme: ColorScheme = {
					colors: preset.colors,
					mapping: {
						// Use the preset's predefined bio and cart mappings
						backgroundColor: preset.bioMapping.bgColor,
						textColor: preset.bioMapping.textColor,
						buttonColor: preset.cartMapping.blockColor, // Cart's blockColor maps to buttonColor
						buttonTextColor: preset.cartMapping.blockTextColor,
						buttonOutlineColor: preset.bioMapping.textColor,
						blockColor: preset.bioMapping.blockColor,
						blockTextColor: preset.bioMapping.blockTextColor,
						bannerColor: preset.bioMapping.bannerColor,
					},
				};
				onColorSchemeChange(fullScheme);
			}
		}
	};

	const renderColorCard = (
		preset: { key: BrandKitColorPresetKey } & BrandKitColorPreset,
	) => {
		const isSelected = colorPreset === preset.key;
		const { colors } = preset; // Use colors directly from preset

		return (
			<button
				key={preset.key}
				type='button'
				onClick={() => handlePresetSelect(preset.key)}
				className={cn(
					'relative rounded-lg border-2 p-6 transition-all hover:shadow-md',
					isSelected && 'border-brand bg-black text-white',
					!isSelected &&
						'border-border bg-white text-black hover:border-muted-foreground',
				)}
			>
				{/* Three overlapping circles - responsive sizing */}
				<div className='mb-4 flex justify-center'>
					<div className='relative h-8 w-20 sm:h-10 sm:w-28 md:h-12 md:w-32'>
						<div
							className={cn(
								'absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full sm:h-8 sm:w-8 md:h-10 md:w-10',
								isSelected ? 'border-2 border-white' : 'border border-gray-200',
							)}
							style={{ backgroundColor: colors[0] }}
						/>
						<div
							className={cn(
								'absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-8 sm:w-8 md:h-10 md:w-10',
								isSelected ? 'border-2 border-white' : 'border border-gray-200',
							)}
							style={{ backgroundColor: colors[1] }}
						/>
						<div
							className={cn(
								'absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full sm:h-8 sm:w-8 md:h-10 md:w-10',
								isSelected ? 'border-2 border-white' : 'border border-gray-200',
							)}
							style={{ backgroundColor: colors[2] }}
						/>
					</div>
				</div>

				{/* Preset name */}
				<Text
					variant='sm/semibold'
					className={cn('text-center', isSelected ? 'text-white' : 'text-black')}
				>
					{preset.name}
				</Text>

				{/* Shuffle icon for selected */}
				{isSelected && (
					<div className='absolute right-2 top-2'>
						<Icon.shuffle className='h-4 w-4 text-white' />
					</div>
				)}
			</button>
		);
	};

	// Handle shuffle all
	const handleShuffleAll = () => {
		if (onBioColorSchemeChange && onCartColorSchemeChange) {
			// Shuffle bio mapping
			const bioMapping = shuffleBioColorMapping();
			onBioColorSchemeChange(bioMapping);

			// Shuffle cart mapping
			const cartMapping = shuffleCartColorMapping();
			onCartColorSchemeChange(cartMapping);
		}
	};

	return (
		<div className='space-y-4'>
			<Tabs
				value={activeTab}
				onValueChange={val => setActiveTab(val as BrandKitColorPreset['type'])}
			>
				<TabsList className='grid w-full grid-cols-4'>
					<TabsTrigger value='neutral'>Neutral</TabsTrigger>
					<TabsTrigger value='bold'>Bold</TabsTrigger>
					<TabsTrigger value='playful'>Playful</TabsTrigger>
					<TabsTrigger value='custom'>Custom</TabsTrigger>
				</TabsList>

				<TabsContent value='neutral' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('neutral').map(preset => renderColorCard(preset))}
					</div>
				</TabsContent>

				<TabsContent value='bold' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('bold').map(preset => renderColorCard(preset))}
					</div>
				</TabsContent>

				<TabsContent value='playful' className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{getAppearancesByType('playful').map(preset => renderColorCard(preset))}
					</div>
				</TabsContent>

				<TabsContent value='custom' className='mt-4'>
					<CustomColorPicker
						colorPreset={colorPreset}
						colorScheme={currentScheme}
						color1={color1}
						color2={color2}
						color3={color3}
						onColorsChange={onColorsChange}
						onColorPresetChange={onColorPresetChange}
					/>
				</TabsContent>
			</Tabs>

			{/* Shuffle Buttons - Outside tabs, apply to all presets */}
			<div className='flex flex-col gap-2'>
				<Text variant='sm/semibold' className='mb-1'>
					Shuffle Color Mappings
				</Text>
				<Text variant='xs/normal' className='mb-2 text-muted-foreground'>
					Rearrange how your colors are applied to different elements
				</Text>
				<div className='flex flex-wrap gap-2'>
					<Button
						type='button'
						size='sm'
						onClick={handleShuffleAll}
						className='gap-2'
						disabled={!onBioColorSchemeChange || !onCartColorSchemeChange}
					>
						<Icon.shuffle className='h-4 w-4' />
						Shuffle All
					</Button>
					<Button
						type='button'
						size='sm'
						onClick={() => {
							if (onBioColorSchemeChange) {
								const bioMapping = shuffleBioColorMapping();
								onBioColorSchemeChange(bioMapping);
							}
						}}
						className='gap-2 border border-border bg-background text-foreground hover:bg-accent'
						disabled={!onBioColorSchemeChange}
					>
						<Icon.shuffle className='h-4 w-4' />
						Shuffle Bio
					</Button>
					<Button
						type='button'
						size='sm'
						onClick={() => {
							if (onCartColorSchemeChange) {
								const cartMapping = shuffleCartColorMapping();
								onCartColorSchemeChange(cartMapping);
							}
						}}
						className='gap-2 border border-border bg-background text-foreground hover:bg-accent'
						disabled={!onCartColorSchemeChange}
					>
						<Icon.shuffle className='h-4 w-4' />
						Shuffle Cart
					</Button>
				</div>
			</div>

			{/* Info about clicking to shuffle */}
			{colorPreset && colorPreset !== 'custom' && (
				<div className='rounded-lg bg-muted/50 p-3'>
					<Text variant='xs/normal' className='text-muted-foreground'>
						💡 Click the selected color scheme again to shuffle how colors map to elements
					</Text>
				</div>
			)}
		</div>
	);
}

// Custom Color Picker Component
interface CustomColorPickerProps {
	colorPreset?: string | null;
	colorScheme: ColorScheme | null;
	color1?: string | null;
	color2?: string | null;
	color3?: string | null;
	onColorsChange?: (colors: [string, string, string]) => void;
	onColorPresetChange: (preset: string) => void;
}

function CustomColorPicker({
	colorPreset,
	colorScheme,
	color1,
	color2,
	color3,
	onColorsChange,
	onColorPresetChange,
}: CustomColorPickerProps) {
	const oklch = converter('oklch');

	// Convert OKLCH to hex if needed
	const oklchToHex = (oklchString: string): string => {
		try {
			// Handle CSS oklch() format: "oklch(0.5 0.1 0)" or "oklch(50% 0.1 0)"
			if (oklchString.startsWith('oklch(')) {
				const match = /oklch\(([\d.%]+)\s+([\d.]+)\s+([\d.]+)\)/.exec(oklchString);
				if (match?.[1] && match[2] && match[3]) {
					const lValue =
						match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
					const color = {
						mode: 'oklch' as const,
						l: lValue,
						c: parseFloat(match[2]),
						h: parseFloat(match[3]),
					};
					return formatHex(color);
				}
			}
			// Handle raw format: "0.5 0.1 0"
			const parts = oklchString.split(' ');
			if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
				const color = {
					mode: 'oklch' as const,
					l: parseFloat(parts[0]),
					c: parseFloat(parts[1]),
					h: parseFloat(parts[2]),
				};
				return formatHex(color);
			}
		} catch (e) {
			console.error('Error parsing OKLCH:', e);
		}
		// If it's already hex or can't parse, return as is
		return oklchString.startsWith('#') ? oklchString : '#000000';
	};

	// Convert OKLCH colors to hex for the color picker
	// Only use colorScheme if appearancePreset is 'custom', otherwise use defaults
	const initialColors =
		colorPreset === 'custom' && colorScheme ?
			(colorScheme.colors.map(c => oklchToHex(c)) as [string, string, string])
		:	(['#F97316', '#8B5CF6', '#06B6D4'] as [string, string, string]); // Default brand colors

	const [colors, setColors] = useState<[string, string, string]>(initialColors);
	const [openPopovers, setOpenPopovers] = useState<boolean[]>([false, false, false]);

	// Convert hex to OKLCH format
	const hexToOklch = (hex: string): string => {
		try {
			const color = oklch(hex);
			if (color) {
				// Format as CSS oklch() function: "oklch(L C H)"
				const l = color.l.toFixed(2);
				const c = color.c.toFixed(3);
				const h = (color.h ?? 0).toFixed(0);
				return `oklch(${l} ${c} ${h})`;
			}
		} catch (e) {
			console.error('Error converting color:', e);
		}
		return 'oklch(0.5 0.1 0)'; // fallback in CSS format
	};

	const handleColorChange = (color: string, index: number) => {
		const newColors = [...colors] as [string, string, string];
		newColors[index] = color;
		setColors(newColors);
	};

	const handleApplyColors = () => {
		if (onColorsChange) {
			// Convert hex colors to OKLCH and apply
			const oklchColors = colors.map(hexToOklch) as [string, string, string];
			onColorsChange(oklchColors);
			onColorPresetChange('custom');
		}
	};

	const handleSyncFromPreset = () => {
		// Pull the current preset colors into the custom color pickers
		if (color1 && color2 && color3) {
			const newColors: [string, string, string] = [
				oklchToHex(color1),
				oklchToHex(color2),
				oklchToHex(color3),
			];
			setColors(newColors);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Color Circles */}
			<div className='space-y-4'>
				<div>
					<Text variant='sm/semibold' className='mb-2'>
						Choose Your Colors
					</Text>
					<Text variant='xs/normal' className='text-muted-foreground'>
						Click on a color to customize it. Changes apply in real-time to the preview.
					</Text>
				</div>

				<div className='flex items-center justify-center gap-4'>
					{colors.map((color, index) => (
						<Popover
							key={index}
							open={openPopovers[index]}
							onOpenChange={open => {
								const newOpenState = [...openPopovers];
								newOpenState[index] = open;
								setOpenPopovers(newOpenState);
							}}
						>
							<PopoverTrigger asChild>
								<button
									type='button'
									className={cn(
										'relative h-16 w-16 rounded-full border-4 transition-all hover:scale-110',
										openPopovers[index] ?
											'border-brand ring-4 ring-brand/20'
										:	'border-border hover:border-muted-foreground',
									)}
									style={{ backgroundColor: color }}
								>
									{openPopovers[index] && (
										<div className='absolute -right-2 -top-2 rounded-full bg-brand p-1'>
											<Icon.check className='h-3 w-3 text-white' />
										</div>
									)}
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-3' align='center' sideOffset={8}>
								<div className='space-y-3'>
									<Text variant='sm/semibold' className='text-center'>
										Color {index + 1}
									</Text>
									<HexColorPicker
										color={color}
										onChange={newColor => handleColorChange(newColor, index)}
										style={{ width: '200px', height: '200px' }}
									/>
									<div className='flex items-center gap-2'>
										<input
											type='text'
											value={color}
											onChange={e => handleColorChange(e.target.value, index)}
											className='w-full rounded border px-2 py-1 text-sm'
											placeholder='#000000'
										/>
										<Text variant='xs/normal' className='text-muted-foreground'>
											HEX
										</Text>
									</div>
									<div className='text-center text-xs text-muted-foreground'>
										→ {hexToOklch(color)}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					))}
				</div>
			</div>

			{/* Custom Color Action Buttons */}
			<div className='flex justify-center gap-2'>
				<Button
					type='button'
					size='sm'
					onClick={handleSyncFromPreset}
					className='gap-2 border border-border bg-background text-foreground hover:bg-accent'
					disabled={!color1 || !color2 || !color3 || colorPreset === 'custom'}
					title={
						colorPreset === 'custom' ?
							'Already using custom colors'
						:	'Pull colors from current preset'
					}
				>
					<Icon.download className='h-4 w-4' />
					Sync from Preset
				</Button>
				<Button
					type='button'
					size='sm'
					onClick={handleApplyColors}
					className='gap-2'
					disabled={!onColorsChange}
				>
					<Icon.check className='h-4 w-4' />
					Apply Custom Colors
				</Button>
			</div>
		</div>
	);
}
