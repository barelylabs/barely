'use client';

import type { ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import type { BioButtonWithLink } from '@barely/validators';
import { getComputedStyles } from '@barely/lib/functions/bio-themes-v2';
import { detectLinkType, getLinkTypeInfo } from '@barely/lib/functions/link-type.fns';
import { cn } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { Icon } from '@barely/ui/icon';

interface BioButtonPublicProps {
	button: BioButtonWithLink & { lexoRank: string };
	bioId: string;
	colorScheme?: ColorScheme | null;
	position: number;
	usePlatformColors?: boolean;
}

export function BioButtonPublic({
	button,
	bioId,
	colorScheme,
	position,
	usePlatformColors = true,
}: BioButtonPublicProps) {
	const trpc = useBioRenderTRPC();
	const { mutate: logEvent } = useMutation(trpc.bio.log.mutationOptions());

	const linkType = button.link ? detectLinkType(button.link.url) : 'url';
	const linkInfo = getLinkTypeInfo(linkType);
	const computedStyles = getComputedStyles({ colorScheme });

	// Use computed styles for button appearance
	const buttonStyles = {
		background: computedStyles.colors.button,
		color: computedStyles.colors.buttonText,
		border: `2px solid ${computedStyles.colors.buttonOutline}`,
	};

	const handleClick = () => {
		// Log the button click event
		logEvent({
			bioId,
			type: 'bio/buttonClick' as const,
			buttonId: button.id,
			buttonPosition: position,
		});
	};

	// For V2, we don't use gradients in the same way, so simplified hover handling
	const hoverStyles = {
		backgroundColor: computedStyles.colors.button,
		borderColor: computedStyles.colors.buttonOutline,
		color: computedStyles.colors.buttonText,
	};

	return (
		<a
			href={button.link?.url ?? '#'}
			target='_blank'
			rel='noopener noreferrer'
			onClick={handleClick}
			className={cn(
				'group relative flex items-center gap-3 rounded-full px-6 py-4',
				'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
				'active:scale-[0.98]',
			)}
			style={buttonStyles}
			onMouseEnter={e => {
				e.currentTarget.style.backgroundColor = hoverStyles.backgroundColor;
				e.currentTarget.style.borderColor = hoverStyles.borderColor;
				e.currentTarget.style.color = hoverStyles.color;
			}}
			onMouseLeave={e => {
				e.currentTarget.style.backgroundColor = buttonStyles.background;
				e.currentTarget.style.borderColor = computedStyles.colors.buttonOutline;
				e.currentTarget.style.color = buttonStyles.color;
			}}
		>
			{/* Icon */}
			{linkInfo.icon &&
				(() => {
					const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
					return (
						<IconComponent
							className='h-5 w-5 flex-shrink-0'
							style={{ color: computedStyles.colors.buttonText }}
						/>
					);
				})()}

			{/* Text */}
			<span className='flex-1 text-center font-medium'>{button.text}</span>

			{/* Arrow on hover */}
			<Icon.arrowRight
				className='h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
				style={{ color: computedStyles.colors.buttonText }}
			/>
		</a>
	);
}
