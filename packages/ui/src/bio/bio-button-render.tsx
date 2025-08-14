'use client';

import type { ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import type { BioButtonWithLink } from '@barely/validators';
import { getComputedStyles } from '@barely/lib/functions/bio-themes-v2';
import { detectLinkType, getLinkTypeInfo } from '@barely/lib/functions/link-type.fns';
import { cn } from '@barely/utils';

import { Icon } from '../elements/icon';

interface BioButtonRenderProps {
	button: BioButtonWithLink & { lexoRank: string };
	position: number;
	colorScheme?: ColorScheme | null;
	onClick?: () => void | Promise<void>;
	isPreview?: boolean;
}

export function BioButtonRender({
	button,
	colorScheme,
	onClick,
	isPreview = false,
}: BioButtonRenderProps) {
	const linkType = button.link ? detectLinkType(button.link.url) : 'url';
	const linkInfo = getLinkTypeInfo(linkType);
	const computedStyles = getComputedStyles({ colorScheme });

	// Use computed styles for button appearance
	const buttonStyles = {
		background: computedStyles.colors.button,
		color: computedStyles.colors.buttonText,
		border: `2px solid ${computedStyles.colors.buttonOutline}`,
	};

	// Determine button URL
	const buttonUrl = button.link?.url ?? button.email ?? button.phone ?? '#';
	const isClickable = !isPreview && buttonUrl !== '#';

	const handleClick = async (e: React.MouseEvent) => {
		if (isPreview) {
			e.preventDefault();
			return;
		}

		// Call the onClick callback if provided
		if (onClick) {
			await onClick();
		}
	};

	return (
		<a
			href={buttonUrl}
			target={isClickable ? '_blank' : undefined}
			rel={isClickable ? 'noopener noreferrer' : undefined}
			onClick={handleClick}
			className={cn(
				'flex items-center gap-3 rounded-full px-4 py-3',
				'transition-all duration-200',
				'block no-underline',
				isClickable && 'cursor-pointer hover:scale-[1.02]',
				isPreview && 'pointer-events-none',
			)}
			style={buttonStyles}
		>
			{/* Icon */}
			{linkInfo.icon &&
				(() => {
					const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
					return IconComponent ?
							<IconComponent
								className='h-4 w-4 flex-shrink-0'
								style={{ color: computedStyles.colors.buttonText }}
							/>
						:	null;
				})()}

			{/* Text */}
			<span className='flex-1 text-center text-sm' style={{ fontWeight: 500 }}>
				{button.text}
			</span>
		</a>
	);
}
