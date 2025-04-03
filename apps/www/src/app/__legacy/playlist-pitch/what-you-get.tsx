import { FeatureCard } from '@barely/ui/components/feature-card';
import { AnimateOnScroll } from '@barely/ui/elements/animate-on-scroll';
import { Icon } from '@barely/ui/elements/icon';
import { H, Lead } from '@barely/ui/elements/typography';

const iconClasses = 'h-14 w-14';

const items = [
	{
		title: 'Matches with relevant curators',
		description: `No need to search for curators, analyze their playlists, cold-email them, or negotiate for their time.`,
		icon: <Icon.magnet className={iconClasses} />,
	},
	{
		title: 'Feedback',
		description: `Find out what curators think of your music, how you can improve your tracks, and/or tips for how to market your music going forward.`,
		icon: <Icon.star className={iconClasses} />,
	},
	{
		title: 'Algorithmic boost',
		description: `Teach the Spotify algorithm to recommend your music to listeners who are most likely to enjoy it.`,
		icon: <Icon.binary className={iconClasses} />,
	},
	{
		title: 'Instant fans',
		description: `Every playlist in our network is actively promoted. If you're placed, you're guaranteed a healthy stream of listeners.`,
		icon: <Icon.users className={iconClasses} />,
	},
	{
		title: 'Retargetable Audience',
		description: `After your campaign, we'll help you retarget an audience of engaged listeners who have already discovered your music.`,
		icon: <Icon.target className={iconClasses} />,
	},
	{
		title: 'Artist protection',
		description:
			'While you are never guaranteed placements, you will always receive feedback. At the end of your campaign, you will receive a full refund for any incomplete reviews.',
		icon: <Icon.shield className={iconClasses} />,
	},
];

const WhatYouGet = () => {
	return (
		<div className='mt-10 flex w-full flex-col items-center space-y-4 text-center sm:mt-20'>
			<AnimateOnScroll fade slideFrom='bottom'>
				<H size='1' className='mt-14'>
					What you get
				</H>
			</AnimateOnScroll>
			<AnimateOnScroll fade slideFrom='bottom'>
				<Lead className='max-w-2xl'>
					Designed to be the <span className='font-medium underline'>first step</span> in
					your marketing strategy, playlist.pitch campaigns combine access to relevant
					listeners with actionable steps to continue growing your audience.
				</Lead>
			</AnimateOnScroll>

			<div className='w-full overflow-hidden pt-8 md:h-auto md:overflow-auto'>
				<div className='flex snap-x snap-mandatory gap-6 overflow-x-scroll scroll-smooth pb-4 sm:grid sm:grid-cols-2 sm:pb-12 md:grid-cols-3'>
					{items.map((item, index) => (
						<div
							key={index}
							className='md:shrink-1 relative flex w-full shrink-0 snap-center flex-col'
						>
							<FeatureCard
								className='h-full'
								title={item.title}
								description={item.description}
							>
								{item.icon}
							</FeatureCard>
						</div>
					))}

					{/* <div className='relative flex min-h-[48rem] w-full shrink-0 snap-center flex-col items-center justify-end overflow-hidden rounded-[4.8rem] border border-gray-100 bg-glass-gradient p-8 text-center md:basis-[calc(33.33%-12px)] md:p-14'>
						<div className='mask-linear-faded absolute top-[-9.2rem]'></div>
						<p className='mb-4 text-3xl'>Breathtakingly fast</p>
						<p className='text-md text-gray-300'>
							Built for speed with 50ms interactions and real-time sync.
						</p>
					</div> */}
				</div>
			</div>
			{/* <AnimateOnScroll threshold={0} fade></AnimateOnScroll> */}
		</div>
	);
};

export { WhatYouGet };
