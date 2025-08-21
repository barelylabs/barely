'use client';

import type { BrandKitColorPreset, BrandKitColorPresetKey } from '@barely/const';
import type { ColorScheme } from '@barely/validators';
import { useEffect, useState } from 'react';
import { BRAND_KIT_COLOR_PRESETS } from '@barely/const';
import { cn, getAppearancesByType, shuffleColorMapping } from '@barely/utils';
import { converter, formatHex } from 'culori';
import { HexColorPicker } from 'react-colorful';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

// import type {
// 	ColorPreset,
// 	ColorScheme,
// } from '../../../../../../../packages/lib/utils/src/bio-themes.fns';
// import {
// 	COLOR_PRESETS,
// 	getAppearancesByType,
// 	shuffleColorMapping,
// } from '../../../../../../../packages/lib/utils/src/bio-themes.fns';

interface ColorCustomizerProps {
	colorPreset?: string | null;
	colorScheme?: ColorScheme | string | null;
	onColorPresetChange: (preset: string) => void;
	onColorSchemeChange: (scheme: ColorScheme) => void;
}

export function ColorCustomizer({
	colorPreset,
	colorScheme,
	onColorPresetChange,
	onColorSchemeChange,
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
			// if (!preset) return; // Guard against undefined preset

			// If clicking the already selected preset, shuffle the colors
			if (colorPreset === presetKey && currentScheme) {
				try {
					const shuffled = shuffleColorMapping(currentScheme);
					onColorSchemeChange(shuffled);
				} catch (error) {
					console.error('Failed to shuffle color mapping:', error);
					// Fallback: keep the current scheme
				}
			} else {
				// Otherwise, select the preset
				onColorPresetChange(presetKey);
				onColorSchemeChange(preset.colorScheme);
			}
		}
	};

	const renderColorCard = (
		preset: { key: BrandKitColorPresetKey } & BrandKitColorPreset,
	) => {
		const isSelected = colorPreset === preset.key;
		const { colors } = preset.colorScheme;

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
						onColorSchemeChange={scheme => {
							onColorPresetChange('custom');
							onColorSchemeChange(scheme);
						}}
					/>
				</TabsContent>
			</Tabs>

			{/* Info about clicking to shuffle */}
			{colorPreset && (
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
	onColorSchemeChange: (scheme: ColorScheme) => void;
}

function CustomColorPicker({
	colorPreset,
	colorScheme,
	onColorSchemeChange,
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

	// Initialize with default colors or existing scheme
	const defaultScheme: ColorScheme = colorScheme ?? {
		colors: ['oklch(0.77 0.141 91)', 'oklch(0.73 0.151 65)', 'oklch(0.69 0.172 48)'] as [
			string,
			string,
			string,
		],
		mapping: {
			backgroundColor: 0,
			textColor: 2,
			buttonColor: 1,
			buttonTextColor: 0,
			buttonOutlineColor: 2,
			blockColor: 0,
			blockTextColor: 2,
			bannerColor: 1,
		},
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

		// Convert to OKLCH and update immediately (real-time preview)
		const oklchColors = newColors.map(hexToOklch) as [string, string, string];
		onColorSchemeChange({
			colors: oklchColors,
			mapping: defaultScheme.mapping,
		});
	};

	const handleShuffle = () => {
		try {
			// Always use the current colors and create a new shuffled mapping
			const oklchColors = colors.map(hexToOklch) as [string, string, string];
			const currentScheme: ColorScheme = {
				colors: oklchColors,
				mapping: colorScheme?.mapping ?? defaultScheme.mapping,
			};
			const shuffled = shuffleColorMapping(currentScheme);
			onColorSchemeChange(shuffled);
		} catch (error) {
			console.error('Failed to shuffle color mapping:', error);
			// Fallback: keep the current scheme
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

			{/* Shuffle Button */}
			<div className='flex justify-center'>
				<Button type='button' size='sm' onClick={handleShuffle} className='gap-2'>
					<Icon.shuffle className='h-4 w-4' />
					{colorPreset === 'custom' ? 'Shuffle Custom Colors' : 'Apply Custom Colors'}
				</Button>
			</div>

			{/* <div className='rounded-lg bg-muted/50 p-3'>
				<Text variant='xs/normal' className='text-muted-foreground'>
					💡 Your custom colors will be converted to OKLCH format for better color
					consistency across devices
				</Text>
			</div> */}
		</div>
	);
}
