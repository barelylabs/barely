'use client';

import type { ThemeCategory } from '@barely/lib/functions/bio-themes-v2';
import { getThemesByCategory, THEMES } from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';

interface ThemeCategorySelectorProps {
	value?: ThemeCategory | null;
	onChange: (category: ThemeCategory) => void;
}

const CATEGORY_STYLES: Record<
	ThemeCategory,
	{
		gradient: string;
		icon: keyof typeof Icon;
		description: string;
	}
> = {
	classic: {
		gradient: 'from-gray-50 to-gray-100',
		icon: 'user',
		description: 'Timeless and professional designs',
	},
	vibrant: {
		gradient: 'from-pink-100 via-purple-100 to-indigo-100',
		icon: 'star',
		description: 'Bold and energetic themes',
	},
	cozy: {
		gradient: 'from-amber-50 to-orange-100',
		icon: 'heart',
		description: 'Warm and inviting styles',
	},
	bold: {
		gradient: 'from-gray-900 to-gray-700',
		icon: 'flame',
		description: 'High contrast and impactful',
	},
};

export function ThemeCategorySelector({ value, onChange }: ThemeCategorySelectorProps) {
	const categories: ThemeCategory[] = ['classic', 'vibrant', 'cozy', 'bold'];

	return (
		<div className='grid grid-cols-2 gap-4'>
			{categories.map(category => {
				const themes = getThemesByCategory(category);
				const style = CATEGORY_STYLES[category];
				const IconComponent = Icon[style.icon];
				const isSelected = value === category;

				return (
					<button
						key={category}
						type='button'
						onClick={() => onChange(category)}
						className={cn(
							'group relative overflow-hidden rounded-lg border-2 p-6 text-left transition-all',
							'hover:shadow-lg',
							isSelected && 'border-brand ring-2 ring-brand/20',
							!isSelected && 'border-border hover:border-muted-foreground',
						)}
					>
						{/* Background gradient preview */}
						<div
							className={cn(
								'absolute inset-0 bg-gradient-to-br opacity-20',
								style.gradient,
							)}
						/>

						{/* Content */}
						<div className='relative space-y-3'>
							{/* Header */}
							<div className='flex items-start justify-between'>
								<div className='flex items-center gap-2'>
									<IconComponent className='h-5 w-5' />
									<h3 className='text-lg font-semibold capitalize'>{category}</h3>
								</div>
								{isSelected && <Icon.checkCircle className='h-5 w-5 text-brand' />}
							</div>

							{/* Description */}
							<p className='text-sm text-muted-foreground'>{style.description}</p>

							{/* Theme previews */}
							<div className='flex flex-wrap gap-2'>
								{themes.map(theme => (
									<Badge key={theme.key} variant='secondary' className='text-xs'>
										{theme.name}
									</Badge>
								))}
							</div>

							{/* Preview thumbnails */}
							<div className='flex gap-2'>
								{themes.slice(0, 2).map(theme => (
									<div key={theme.key} className='h-16 w-20 rounded border bg-white'>
										{/* Mini preview of theme */}
										<div className='flex h-full flex-col items-center justify-center gap-1 p-2'>
											<div className='h-2 w-2 rounded-full bg-gray-400' />
											<div className='h-1 w-10 rounded-full bg-gray-300' />
											<div className='h-3 w-12 rounded-full border border-gray-300' />
											<div className='h-3 w-12 rounded-full border border-gray-300' />
										</div>
									</div>
								))}
							</div>
						</div>
					</button>
				);
			})}
		</div>
	);
}
