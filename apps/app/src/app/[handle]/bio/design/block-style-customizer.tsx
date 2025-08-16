'use client';

import type { BlockStyle } from '@barely/lib/functions/bio-themes.fns';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

interface BlockStyleCustomizerProps {
	blockStyle: BlockStyle;
	blockShadow: boolean;
	blockOutline: boolean;
	onBlockStyleChange: (style: BlockStyle) => void;
	onBlockShadowChange: (enabled: boolean) => void;
	onBlockOutlineChange: (enabled: boolean) => void;
}

const BLOCK_STYLES: Record<
	BlockStyle,
	{
		name: string;
		description: string;
		preview: React.ReactNode;
	}
> = {
	rounded: {
		name: 'Rounded',
		description: 'Soft rounded corners',
		preview: (
			<div className='h-10 w-24 rounded-xl border-2 border-gray-300 bg-gray-100' />
		),
	},
	oval: {
		name: 'Oval',
		description: 'Pill-shaped buttons',
		preview: (
			<div className='h-10 w-24 rounded-full border-2 border-gray-300 bg-gray-100' />
		),
	},
	square: {
		name: 'Square',
		description: 'Sharp corners',
		preview: <div className='h-10 w-24 border-2 border-gray-300 bg-gray-100' />,
	},
	'full-width': {
		name: 'Full Width',
		description: 'Full width on mobile, square on desktop',
		preview: <div className='h-10 w-24 border-2 border-gray-300 bg-gray-100' />,
	},
};

export function BlockStyleCustomizer({
	blockStyle,
	blockShadow,
	blockOutline,
	onBlockStyleChange,
	onBlockShadowChange,
	onBlockOutlineChange,
}: BlockStyleCustomizerProps) {
	const styles: BlockStyle[] = ['rounded', 'oval', 'square', 'full-width'];

	return (
		<div className='space-y-6'>
			{/* Block Shape Selection */}
			<div>
				<Text variant='sm/semibold' className='mb-4'>
					Button Shape
				</Text>
				<div className='grid gap-4 sm:grid-cols-2'>
					{styles.map(style => {
						const config = BLOCK_STYLES[style];
						const isSelected = blockStyle === style;

						return (
							<button
								key={style}
								type='button'
								onClick={() => onBlockStyleChange(style)}
								className={cn(
									'relative rounded-lg border-2 p-6 transition-all hover:shadow-md',
									isSelected && 'border-brand ring-2 ring-brand/20',
									!isSelected && 'border-border hover:border-muted-foreground',
								)}
							>
								{/* Preview */}
								<div className='mb-4 flex justify-center'>
									<div
										className='relative'
										style={{
											filter:
												blockShadow ? 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))' : 'none',
										}}
									>
										{config.preview}
										{blockOutline && (
											<div
												className={cn(
													'absolute inset-0 border-2 border-black',
													style === 'rounded' && 'rounded-xl',
													style === 'oval' && 'rounded-full',
													style === 'square' && 'rounded-none',
													style === 'full-width' && 'rounded-none',
												)}
											/>
										)}
									</div>
								</div>

								{/* Label */}
								<div className='space-y-1'>
									<div className='flex items-center justify-between'>
										<Text variant='sm/semibold'>{config.name}</Text>
										{isSelected && <Icon.checkCircle className='h-4 w-4 text-brand' />}
									</div>
									<Text variant='xs/normal' className='text-muted-foreground'>
										{config.description}
									</Text>
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Effects Options */}
			<div className='space-y-4'>
				<Text variant='sm/semibold'>Effects</Text>

				<div className='space-y-3'>
					{/* Block Shadow Toggle */}
					<div className='flex items-center justify-between rounded-lg border p-4'>
						<div className='space-y-0.5'>
							<Label htmlFor='block-shadow' className='cursor-pointer text-base'>
								Block Shadow
							</Label>
							<Text variant='xs/normal' className='text-muted-foreground'>
								Add a subtle drop shadow to buttons
							</Text>
						</div>
						<Switch
							id='block-shadow'
							checked={blockShadow}
							onCheckedChange={onBlockShadowChange}
						/>
					</div>

					{/* Block Outline Toggle */}
					<div className='flex items-center justify-between rounded-lg border p-4'>
						<div className='space-y-0.5'>
							<Label htmlFor='block-outline' className='cursor-pointer text-base'>
								Block Outline
							</Label>
							<Text variant='xs/normal' className='text-muted-foreground'>
								Add a border outline to buttons
							</Text>
						</div>
						<Switch
							id='block-outline'
							checked={blockOutline}
							onCheckedChange={onBlockOutlineChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
