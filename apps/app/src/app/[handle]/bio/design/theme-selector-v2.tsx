'use client';

import type { ThemeCategory } from '@barely/lib/functions/bio-themes-v2';
import { useEffect, useState } from 'react';
import { getThemesByCategory, THEMES } from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

interface ThemeSelectorV2Props {
	value?: string | null; // The selected theme key (e.g., 'timeless', 'elegant')
	themeCategory?: ThemeCategory | null;
	onChange: (themeKey: string, category: ThemeCategory) => void;
}

export function ThemeSelectorV2({
	value,
	themeCategory,
	onChange,
}: ThemeSelectorV2Props) {
	const categories: ThemeCategory[] = ['classic', 'vibrant', 'cozy', 'bold'];

	// Determine which tab should be active based on the current value
	const [activeCategory, setActiveCategory] = useState<ThemeCategory>(() => {
		if (themeCategory) return themeCategory;
		// If we have a value, find its category
		if (value) {
			const theme = THEMES[value];
			if (theme) return theme.category;
		}
		return 'classic';
	});

	// Update active category when themeCategory prop changes
	useEffect(() => {
		if (themeCategory) {
			setActiveCategory(themeCategory);
		} else if (value) {
			const theme = THEMES[value];
			if (theme) {
				setActiveCategory(theme.category);
			}
		}
	}, [themeCategory, value]);

	const renderThemeCard = (themeKey: string) => {
		const theme = THEMES[themeKey];
		if (!theme) return null;

		const isSelected = value === themeKey;

		return (
			<button
				key={themeKey}
				type='button'
				onClick={() => onChange(themeKey, theme.category)}
				className={cn(
					'relative rounded-lg border-2 p-6 text-left transition-all hover:shadow-md',
					isSelected && 'border-brand ring-2 ring-brand/20',
					!isSelected && 'border-border hover:border-muted-foreground',
				)}
			>
				{/* Mini preview */}
				<div className='mb-4'>
					<div className='flex flex-col items-center gap-2'>
						<div className='h-8 w-8 rounded-full bg-gray-300' />
						<div className='h-2 w-16 rounded bg-gray-400' />
						<div className='space-y-1'>
							<div className='h-4 w-20 rounded-full border border-gray-300' />
							<div className='h-4 w-20 rounded-full border border-gray-300' />
						</div>
					</div>
				</div>

				{/* Theme info */}
				<div className='space-y-1'>
					<div className='flex items-center justify-between'>
						<Text variant='sm/semibold'>{theme.name}</Text>
						{isSelected && <Icon.checkCircle className='h-4 w-4 text-brand' />}
					</div>
					<Text variant='xs/normal' className='text-muted-foreground'>
						{theme.description}
					</Text>
				</div>
			</button>
		);
	};

	return (
		<Tabs
			value={activeCategory}
			onValueChange={val => setActiveCategory(val as ThemeCategory)}
		>
			<TabsList className='grid w-full grid-cols-4'>
				<TabsTrigger value='classic'>Classic</TabsTrigger>
				<TabsTrigger value='vibrant'>Vibrant</TabsTrigger>
				<TabsTrigger value='cozy'>Cozy</TabsTrigger>
				<TabsTrigger value='bold'>Bold</TabsTrigger>
			</TabsList>

			{categories.map(category => (
				<TabsContent key={category} value={category} className='mt-4'>
					<div className='grid gap-4 sm:grid-cols-2'>
						{getThemesByCategory(category).map(theme => renderThemeCard(theme.key))}
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}
