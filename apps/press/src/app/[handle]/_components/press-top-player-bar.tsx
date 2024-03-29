'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { cn } from '@barely/lib/utils/cn';

import { MusicPlayButton } from '@barely/ui/elements/music-player';
import { H } from '@barely/ui/elements/typography';

import { PressScrollAreaViewportContext } from '~/app/[handle]/_components/press-scroll-area';
import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function TopPlayerBar({ artistName }: { artistName: string }) {
	const scrollAreaRef = useContext(PressScrollAreaViewportContext);
	const playerBarRef = useRef<HTMLDivElement>(null);

	const [stuckClassName, setStuckClassName] = useState('');

	useEffect(() => {
		const handleScroll = () => {
			if (playerBarRef.current && scrollAreaRef?.current) {
				const playerBarTop = playerBarRef.current.getBoundingClientRect().top;
				const scrollAreaTop = scrollAreaRef.current.getBoundingClientRect().top;

				const isAtTop = playerBarTop - scrollAreaTop <= 0;

				if (isAtTop) {
					setStuckClassName('shadow-lg shadow-slate-800/50');
				} else {
					setStuckClassName('');
				}
			}
		};

		const scrollArea = scrollAreaRef?.current;
		if (scrollArea) {
			scrollArea.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (scrollArea) {
				scrollArea.removeEventListener('scroll', handleScroll);
			}
		};
	}, [scrollAreaRef]);

	return (
		<Section
			ref={playerBarRef}
			id='player-bar'
			className={cn('top-0 z-50 py-6 sm:sticky', stuckClassName)}
		>
			<SectionDiv>
				<div className='flex flex-row items-center'>
					<MusicPlayButton size='lg' />
					<div className='ml-4 flex flex-col justify-center'>
						<H size='3' className='-mt-2 text-gray-300'>
							Listen to {artistName}
						</H>
					</div>
				</div>
			</SectionDiv>
		</Section>
	);
}
