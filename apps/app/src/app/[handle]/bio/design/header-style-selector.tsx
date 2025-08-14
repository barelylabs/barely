'use client';

import type { HeaderStyle } from '@barely/lib/functions/bio-themes-v2';
import { cn } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';

interface HeaderStyleSelectorProps {
	value: HeaderStyle;
	onChange: (style: HeaderStyle) => void;
}

const HEADER_LAYOUTS = {
	minimal: [
		{
			key: 'centered',
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
			key: 'left-aligned',
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
			key: 'hero-fade',
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
	banner: [
		{
			key: 'banner-overlay',
			name: 'Banner with Overlay',
			description: 'Full-width banner image with text overlay',
			preview: (
				<div className='relative h-full w-full bg-gray-200'>
					<div className='absolute bottom-2 left-2'>
						<div className='h-2 w-16 rounded bg-white' />
					</div>
				</div>
			),
			comingSoon: true,
		},
	],
	portrait: [
		{
			key: 'side-portrait',
			name: 'Side Portrait',
			description: 'Large portrait image on the side',
			preview: (
				<div className='flex h-full'>
					<div className='w-1/3 bg-gray-300' />
					<div className='flex flex-1 flex-col justify-center gap-1 p-2'>
						<div className='h-2 w-16 rounded bg-gray-400' />
						<div className='h-1 w-12 rounded bg-gray-300' />
					</div>
				</div>
			),
			comingSoon: true,
		},
	],
	shapes: [
		{
			key: 'geometric',
			name: 'Geometric Shapes',
			description: 'Abstract shapes and patterns in header',
			preview: (
				<div className='relative h-full w-full'>
					<div className='absolute right-2 top-2 h-8 w-8 rotate-45 bg-gray-200' />
					<div className='absolute left-3 top-3 h-6 w-6 rounded-full bg-gray-300' />
					<div className='flex h-full flex-col items-center justify-center gap-1'>
						<div className='h-8 w-8 rounded-full bg-gray-300' />
						<div className='h-2 w-16 rounded bg-gray-400' />
					</div>
				</div>
			),
			comingSoon: true,
		},
	],
};

export function HeaderStyleSelector({ value, onChange }: HeaderStyleSelectorProps) {
	const headerStyles: HeaderStyle[] = ['minimal', 'banner', 'portrait', 'shapes'];

	return (
		<Tabs value={value} onValueChange={val => onChange(val as HeaderStyle)}>
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
						<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{HEADER_LAYOUTS[style].map(layout => (
								<button
									key={layout.key}
									type='button'
									onClick={() => onChange(style)}
									className={cn(
										'group relative h-32 overflow-hidden rounded-lg border-2 p-4',
										'transition-all hover:shadow-md',
										value === style && 'border-brand ring-2 ring-brand/20',
										value !== style && 'border-border hover:border-muted-foreground',
									)}
									disabled={layout.comingSoon}
								>
									{/* Preview */}
									<div className='h-full w-full'>{layout.preview}</div>

									{/* Label */}
									<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2'>
										<p className='text-xs font-medium'>{layout.name}</p>
									</div>

									{/* Selected indicator */}
									{value === style && !layout.comingSoon && (
										<div className='absolute right-2 top-2'>
											<Icon.checkCircle className='h-4 w-4 text-brand' />
										</div>
									)}

									{/* Coming soon badge */}
									{layout.comingSoon && (
										<div className='absolute left-2 top-2'>
											<Badge variant='secondary' className='text-xs'>
												Coming Soon
											</Badge>
										</div>
									)}
								</button>
							))}
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
