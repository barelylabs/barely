'use client';

import type { BioTheme } from '@barely/lib/functions/bio-themes';
import type { BioWithButtons } from '@barely/validators';
import { BIO_THEMES, getButtonStyles } from '@barely/lib/functions/bio-themes';
import { detectLinkType, getLinkTypeInfo } from '@barely/lib/functions/link-type.fns';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';

interface BioPreviewProps {
	bio: BioWithButtons;
	className?: string;
}

export function BioPreview({ bio, className }: BioPreviewProps) {
	// Map database theme to BioTheme
	const mapTheme = (dbTheme: string | null | undefined): BioTheme => {
		if (!dbTheme) return 'default';
		if (dbTheme === 'light') return 'minimal';
		if (dbTheme === 'dark') return 'neon';
		if (dbTheme === 'app') return 'default';
		return 'default';
	};

	const theme = mapTheme(bio.theme);
	const themeConfig = BIO_THEMES[theme];
	const isGradientBg = themeConfig.pageBackground.includes('gradient');

	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-lg border shadow-sm',
				'transition-all duration-300',
				className,
			)}
		>
			{/* Phone Frame */}
			<div className='mx-auto max-w-sm'>
				{/* Phone Status Bar */}
				<div className='flex items-center justify-between bg-black px-4 py-1 text-xs text-white'>
					<span>9:41 AM</span>
					<div className='flex gap-1'>
						<span className='h-3 w-3 rounded-full bg-white' />
						<span className='h-3 w-3 rounded-full bg-white' />
					</div>
				</div>

				{/* Bio Content */}
				<div
					className='min-h-[600px] p-6'
					style={{
						background: isGradientBg ? themeConfig.pageBackground : undefined,
						backgroundColor: !isGradientBg ? themeConfig.pageBackground : undefined,
					}}
				>
					{/* Profile Section */}
					<div className='mb-6 text-center'>
						{/* Avatar */}
						{bio.workspace?.imageUrl && (
							<div className='mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-muted'>
								<img
									src={bio.workspace.imageUrl}
									alt={bio.workspace.name}
									className='h-full w-full object-cover'
								/>
							</div>
						)}

						{/* Title */}
						<h1
							className='mb-2 text-xl font-bold'
							style={{ color: themeConfig.headingText }}
						>
							{bio.title ?? bio.workspace?.name ?? bio.handle}
						</h1>

						{/* Subtitle */}
						{bio.subtitle && (
							<p className='text-sm' style={{ color: themeConfig.pageText }}>
								{bio.subtitle}
							</p>
						)}
					</div>

					{/* Buttons */}
					<div className='space-y-3'>
						{bio.buttons.map(button => {
							const linkType = button.link ? detectLinkType(button.link.url) : 'url';
							const linkInfo = getLinkTypeInfo(linkType);
							const styles = getButtonStyles({
								theme,
								linkType,
								usePlatformColors: true,
							});
							const isGradient = styles.background.includes('gradient');

							return (
								<div
									key={button.id}
									className={cn(
										'flex items-center gap-3 rounded-full px-4 py-3',
										'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
									)}
									style={{
										background: isGradient ? styles.background : undefined,
										backgroundColor: !isGradient ? styles.background : undefined,
										color: styles.text,
										border: `2px solid ${styles.border}`,
									}}
								>
									{/* Icon */}
									{linkInfo.icon &&
										(() => {
											const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
											return IconComponent ?
													<IconComponent
														className='h-4 w-4 flex-shrink-0'
														style={{ color: styles.text }}
													/>
												:	null;
										})()}

									{/* Text */}
									<span className='flex-1 text-center text-sm font-medium'>
										{button.text}
									</span>
								</div>
							);
						})}

						{/* Add Button Placeholder */}
						{bio.buttons.length === 0 && (
							<div
								className='rounded-full border-2 border-dashed px-4 py-3 text-center text-sm'
								style={{
									borderColor: themeConfig.buttonBorder,
									color: themeConfig.pageText,
								}}
							>
								Add your first button
							</div>
						)}
					</div>

					{/* Email Capture (if enabled) */}
					{bio.emailCaptureEnabled && (
						<div className='mt-6'>
							<div
								className='rounded-lg p-4'
								style={{
									backgroundColor: themeConfig.buttonBackground,
									border: `1px solid ${themeConfig.buttonBorder}`,
								}}
							>
								<p
									className='mb-3 text-sm font-medium'
									style={{ color: themeConfig.buttonText }}
								>
									{bio.emailCaptureIncentiveText ?? 'Stay connected'}
								</p>
								<div className='flex gap-2'>
									<input
										type='email'
										placeholder='Enter your email'
										className='flex-1 rounded-md border bg-transparent px-3 py-2 text-sm'
										style={{
											borderColor: themeConfig.buttonBorder,
											color: themeConfig.buttonText,
										}}
										disabled
									/>
									<button
										className='rounded-md px-4 py-2 text-sm font-medium'
										style={{
											backgroundColor: themeConfig.buttonHoverBackground,
											color: themeConfig.buttonText,
										}}
										disabled
									>
										Subscribe
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Barely Branding */}
					{bio.barelyBranding && (
						<div className='mt-8 text-center'>
							<a
								href='https://barely.ai'
								className='text-xs opacity-50'
								style={{ color: themeConfig.pageText }}
							>
								Powered by barely.ai
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
