'use client';

import type { PublicPressKit } from '@barely/lib/server/routes/press-kit/press-kit.schema';
import { useContext, useEffect, useRef, useState } from 'react';

import { WorkspaceSocialLinks } from '@barely/ui/components/workspace-social-links';
import { BackgroundImg } from '@barely/ui/elements/background-image';
import { BottomThirdFadeGradient } from '@barely/ui/elements/gradient';
import { Icon } from '@barely/ui/elements/icon';

import { PressScrollAreaViewportContext } from '~/app/[handle]/_components/press-scroll-area';
import { SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressHero({
	workspace,
	showInstagramLink,
	showYoutubeLink,
	showTiktokLink,
	showSpotifyLink,
	showSocialLinks,
}: PublicPressKit) {
	const scrollAreaRef = useContext(PressScrollAreaViewportContext);

	const pressHeroRef = useRef<HTMLDivElement>(null);

	const [headerOpacity, setHeaderOpacity] = useState(1);
	const [headerZoom, setHeaderZoom] = useState(1.1);

	useEffect(() => {
		const handleScroll = () => {
			if (pressHeroRef.current && scrollAreaRef?.current) {
				const opacity = 1 + pressHeroRef.current.getBoundingClientRect().top / 450;

				const zoom = 1.1 + pressHeroRef.current.getBoundingClientRect().top / 7500;

				setHeaderOpacity(opacity);
				setHeaderZoom(zoom);
			}
		};

		const scrollArea = scrollAreaRef?.current;
		if (scrollArea) scrollArea.addEventListener('scroll', handleScroll);

		return () => {
			if (scrollArea) scrollArea.removeEventListener('scroll', handleScroll);
		};
	}, [scrollAreaRef]);

	const heroText = (
		<>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-50'></div>
			<SectionDiv className='relative h-full justify-end'>
				<div className='flex flex-row items-end justify-between gap-2'>
					<div className='flex flex-col items-end space-y-4'>
						<div>
							<div className='flex flex-row items-center gap-3'>
								<Icon.press className='h-4 w-4 text-white' />
								<p className='text-white'>Press Kit</p>
							</div>
							<p className='-mb-[2px] font-heading text-5xl sm:-mb-[6px] sm:text-7xl md:text-[85px] lg:text-[90px]'>
								{workspace.name}
							</p>
						</div>
					</div>

					<div className='flex flex-row items-end gap-2'>
						{showSocialLinks && (
							<WorkspaceSocialLinks
								workspace={workspace}
								show={{
									instagram: showInstagramLink,
									youtube: showYoutubeLink,
									tiktok: showTiktokLink,
									spotify: showSpotifyLink,
								}}
							/>
						)}
					</div>
				</div>
			</SectionDiv>
		</>
	);

	const heroMobile = (
		<section
			className='relative h-[350px] w-full py-6 sm:hidden sm:h-[400px] md:h-[450px] md:py-10'
			id='intro-mobile'
		>
			<BackgroundImg
				// src={workspace.avatarImageUrl ?? workspace.headerImageUrl ?? ''}
				s3Key={workspace.avatarImageKey ?? workspace.headerImageKey ?? ''}
				alt={workspace.name}
				divStyle={{
					opacity: headerOpacity,
					transform: `scale(${headerZoom})`,
				}}
			>
				<BottomThirdFadeGradient />
			</BackgroundImg>
			{heroText}
		</section>
	);

	const heroDesktop = (
		<section
			id='intro-desktop'
			className='relative hidden h-[350px] w-full py-6 sm:block sm:h-[400px] md:h-[450px] md:py-10'
		>
			<BackgroundImg
				// src={workspace.headerImageUrl ?? workspace.avatarImageUrl ?? ''}
				s3Key={workspace.headerImageKey ?? workspace.avatarImageKey ?? ''}
				alt={workspace.name}
				divStyle={{
					opacity: headerOpacity,
					transform: `scale(${headerZoom})`,
				}}
			>
				<BottomThirdFadeGradient />
			</BackgroundImg>
			{heroText}
		</section>
	);

	return (
		<div ref={pressHeroRef}>
			{heroMobile}
			{heroDesktop}
		</div>
	);
}
