'use client';

import { ReactNode } from 'react';

import { Badge } from '@barely/ui/elements/badge';
import { Button } from '@barely/ui/elements/button';
import { Icon, IconSelection, IconType } from '@barely/ui/elements/icon';
import { HHero, Lead } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/edge/cn';

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
		<div className='flex flex-row pt-32 pb-10 sm:pt-40 sm:pb-10 w-full'>
			<div className='flex flex-col gap-y-4 text-center items-center flex-grow'>
				{!!props.badgeLabel && (
					<Badge
						size='md'
						variant='subtle'
						className={cn(
							'animate-in fade-in delay-1000 duration-1000 fill-mode-both slide-in-from-left-4',
						)}
						icon={props.badgeIcon}
					>
						{props.badgeLabel}
					</Badge>
				)}
				<HHero className={className}>{props.title}</HHero>
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
