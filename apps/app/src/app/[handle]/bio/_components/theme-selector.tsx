'use client';

import type { BioTheme } from '@barely/lib/functions/bio-themes';
import { BIO_THEMES, getButtonStyles } from '@barely/lib/functions/bio-themes';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';

interface ThemeSelectorProps {
	value: BioTheme;
	onChange: (theme: BioTheme) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
	return (
		<div className='space-y-2'>
			<Label>Theme</Label>
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
				{(Object.keys(BIO_THEMES) as BioTheme[]).map(theme => {
					const themeConfig = BIO_THEMES[theme];
					const isSelected = value === theme;
					const styles = getButtonStyles({ theme, usePlatformColors: false });

					return (
						<button
							key={theme}
							type='button'
							onClick={() => onChange(theme)}
							className={cn(
								'group relative overflow-hidden rounded-lg border-2 p-3 transition-all',
								'hover:shadow-md',
								isSelected && 'border-brand',
								!isSelected && 'border-border hover:border-muted-foreground',
							)}
						>
							{/* Theme Preview */}
							<div
								className='mb-2 h-20 rounded'
								style={{
									background: themeConfig.pageBackground,
								}}
							>
								<div className='flex h-full flex-col items-center justify-center gap-1 p-2'>
									<div
										className='h-2 w-12 rounded-full'
										style={{ backgroundColor: themeConfig.headingText }}
									/>
									<div
										className='h-6 w-full rounded-full'
										style={{
											backgroundColor: styles.background,
											border: `1px solid ${styles.border}`,
										}}
									/>
									<div
										className='h-6 w-full rounded-full'
										style={{
											backgroundColor: styles.background,
											border: `1px solid ${styles.border}`,
										}}
									/>
								</div>
							</div>

							{/* Theme Name */}
							<p className='text-sm font-medium'>{themeConfig.name}</p>

							{/* Selected Indicator */}
							{isSelected && (
								<div className='absolute right-2 top-2'>
									<Icon.checkCircle className='h-5 w-5 text-brand' />
								</div>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
