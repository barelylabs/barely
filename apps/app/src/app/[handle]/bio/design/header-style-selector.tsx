'use client';

import type { BioHeaderStyle, BioHeaderStyleCategory } from '@barely/const';
import { cn } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';

interface HeaderStyleSelectorProps {
	value: string; // e.g., 'minimal-centered', 'minimal-left', 'minimal-hero'
	onChange: (style: BioHeaderStyle) => void;
}

const HEADER_LAYOUTS: Record<
	BioHeaderStyleCategory,
	{
		key: BioHeaderStyle;
		name: string;
		description: string;
		preview: React.ReactNode;
	}[]
> = {
	minimal: [
		{
			key: 'minimal.centered',
			name: 'Centered Classic',
			description: 'Traditional centered layout with avatar above title',
			preview: (
				<div className='flex flex-col items-center gap-2'>
					<div className='h-12 w-12 rounded-full bg-gray-300' />
					<div className='h-2 w-20 rounded bg-gray-400' />
					<div className='flex gap-2'>
						<div className='h-4 w-4 rounded bg-gray-300' />
						<div className='h-4 w-4 rounded bg-gray-300' />
						<div className='h-4 w-4 rounded bg-gray-300' />
					</div>
				</div>
			),
		},
		{
			key: 'minimal.left',
			name: 'Left Aligned',
			description: 'Avatar on left with title and socials inline',
			preview: (
				<div className='flex items-center gap-3'>
					<div className='h-12 w-12 rounded-full bg-gray-300' />
					<div className='flex flex-col gap-1'>
						<div className='h-2 w-20 rounded bg-gray-400' />
						<div className='flex gap-1'>
							<div className='h-3 w-3 rounded bg-gray-300' />
							<div className='h-3 w-3 rounded bg-gray-300' />
							<div className='h-3 w-3 rounded bg-gray-300' />
						</div>
					</div>
				</div>
			),
		},
		{
			key: 'minimal.hero',
			name: 'Hero Fade',
			description: 'Large avatar that fades into the background',
			preview: (
				<div className='relative h-full w-full'>
					<div className='absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-4 rounded-full bg-gradient-to-t from-transparent to-gray-300' />
					<div className='absolute bottom-2 left-1/2 -translate-x-1/2'>
						<div className='h-2 w-20 rounded bg-gray-400' />
					</div>
				</div>
			),
		},
	],
	banner: [],
	portrait: [],
	shapes: [],
};

export function HeaderStyleSelector({ value, onChange }: HeaderStyleSelectorProps) {
	// Determine active tab from value (e.g., 'minimal-centered' -> 'minimal')
	const activeTab = value.split('-')[0] ?? 'minimal';
	const headerStyles: BioHeaderStyleCategory[] = [
		'minimal',
		'banner',
		'portrait',
		'shapes',
	];

	return (
		<Tabs
			value={activeTab}
			onValueChange={() => {
				/* Tab is read-only based on selection */
			}}
		>
			<TabsList className='grid w-full grid-cols-4'>
				{headerStyles.map(style => (
					<TabsTrigger key={style} value={style} className='capitalize'>
						{style}
						{style !== 'minimal' && (
							<Badge variant='secondary' className='ml-2 text-xs'>
								Soon
							</Badge>
						)}
					</TabsTrigger>
				))}
			</TabsList>

			{headerStyles.map(style => (
				<TabsContent key={style} value={style} className='mt-4'>
					{style === 'minimal' ?
						<div className='grid gap-4 sm:grid-cols-3'>
							{HEADER_LAYOUTS[style].map(layout => {
								const isSelected = value === layout.key;

								return (
									<button
										key={layout.key}
										type='button'
										onClick={() => {
											if (layout.key in HEADER_LAYOUTS) {
												onChange(layout.key);
											}
										}}
										className={cn(
											'group relative h-32 overflow-hidden rounded-lg border-2 p-4',
											'transition-all hover:shadow-md',
											isSelected && 'border-brand ring-2 ring-brand/20',
											!isSelected && 'border-border hover:border-muted-foreground',
										)}
									>
										{/* Preview */}
										<div className='h-full w-full'>{layout.preview}</div>

										{/* Label */}
										<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2'>
											<p className='text-xs font-medium'>{layout.name}</p>
										</div>

										{/* Selected indicator */}
										{isSelected && (
											<div className='absolute right-2 top-2'>
												<Icon.checkCircle className='h-4 w-4 text-brand' />
											</div>
										)}
									</button>
								);
							})}
						</div>
					:	<div className='rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center'>
							<Icon.wrench className='mx-auto mb-3 h-12 w-12 text-muted-foreground/50' />
							<p className='text-sm text-muted-foreground'>
								{style.charAt(0).toUpperCase() + style.slice(1)} header styles coming soon
							</p>
							<p className='mt-1 text-xs text-muted-foreground'>
								We're working on more header layout options
							</p>
						</div>
					}
				</TabsContent>
			))}
		</Tabs>
	);
}
