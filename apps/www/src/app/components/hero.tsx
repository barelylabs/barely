'use client';

import type { IconSelection, IconType } from '@barely/ui/elements/icon';
import type { ReactNode } from 'react';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { H, Lead } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/cn';

interface HeroProps {
	badgeLabel?: ReactNode;
	badgeIcon?: IconSelection;

	title: ReactNode;
	subtitle: string;

	buttonLabel: string;
	buttonIcon?: IconType;
	buttonLink?: string;
}

const className = 'animate-in fade-in slide-in-from-top-4 duration-1000 fill-mode-both';

const Hero = (props: HeroProps) => {
	return (
		<div className='flex w-full flex-row pb-10 pt-32 sm:pb-10 sm:pt-40'>
			<div className='flex flex-grow flex-col items-center gap-y-4 text-center'>
				{!!props.badgeLabel && (
					<Badge
						size='md'
						variant='subtle'
						className={cn(
							'delay-1000 duration-1000 animate-in fade-in slide-in-from-left-4 fill-mode-both',
						)}
						icon={props.badgeIcon}
					>
						{props.badgeLabel}
					</Badge>
				)}
				<H size='hero' className={className}>
					{props.title}
				</H>
				<Lead className={cn(className, 'delay-500')}>{props.subtitle}</Lead>
				<Button
					href='https://app.barely.io/playlist-pitch'
					size='lg'
					className={cn(className, 'mt-14 delay-700')}
					pill
				>
					{props.buttonLabel}
					<span className='pl-2'>
						<Icon.arrowRight size='20' />
					</span>
				</Button>
			</div>
		</div>
	);
};

export { Hero };
