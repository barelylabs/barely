'use client';

import type { BioTheme } from '@barely/lib/functions/bio-themes';
import type { BioButtonWithLink } from '@barely/validators';
import { getButtonStyles } from '@barely/lib/functions/bio-themes';
import { detectLinkType, getLinkTypeInfo } from '@barely/lib/functions/link-type.fns';
import { cn } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { Icon } from '@barely/ui/icon';

interface BioButtonPublicProps {
	button: BioButtonWithLink & { lexoRank: string };
	bioId: string;
	theme: BioTheme;
	position: number;
	usePlatformColors?: boolean;
}

export function BioButtonPublic({
	button,
	bioId,
	theme,
	position,
	usePlatformColors = true,
}: BioButtonPublicProps) {
	const trpc = useBioRenderTRPC();
	const { mutate: logEvent } = useMutation(trpc.bio.log.mutationOptions());

	const linkType = button.link ? detectLinkType(button.link.url) : 'url';
	const linkInfo = getLinkTypeInfo(linkType);
	const styles = getButtonStyles({ theme, linkType, usePlatformColors });

	const handleClick = () => {
		// Log the button click event
		logEvent({
			bioId,
			type: 'bio/buttonClick' as const,
			buttonId: button.id,
			buttonPosition: position,
		});
	};

	const isGradient = styles.background.includes('gradient');

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
			style={{
				background: isGradient ? styles.background : undefined,
				backgroundColor: !isGradient ? styles.background : undefined,
				color: styles.text,
				border: `2px solid ${styles.border}`,
			}}
			onMouseEnter={e => {
				if (!isGradient) {
					e.currentTarget.style.backgroundColor = styles.hoverBackground;
					e.currentTarget.style.borderColor = styles.hoverBorder;
					if (theme === 'minimal') {
						e.currentTarget.style.color = styles.hoverText;
					}
				}
			}}
			onMouseLeave={e => {
				if (!isGradient) {
					e.currentTarget.style.backgroundColor = styles.background;
					e.currentTarget.style.borderColor = styles.border;
					e.currentTarget.style.color = styles.text;
				}
			}}
		>
			{/* Icon */}
			{linkInfo.icon &&
				(() => {
					const IconComponent = Icon[linkInfo.icon as keyof typeof Icon];
					return (
						<IconComponent
							className='h-5 w-5 flex-shrink-0'
							style={{ color: styles.text }}
						/>
					);
				})()}

			{/* Text */}
			<span className='flex-1 text-center font-medium'>{button.text}</span>

			{/* Arrow on hover */}
			<Icon.arrowRight
				className='h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
				style={{ color: styles.text }}
			/>
		</a>
	);
}
