import { AnimateOnScroll } from '@barely/ui/elements/animate-on-scroll';
import { H, Text } from '@barely/ui/elements/typography';

import { isEven } from '@barely/utils/number';

const items = [
	{
		title: 'Submit your track',
		tag: 'Submit',
		description:
			"Submit your music to our playlist pitching team. We will review your submission and let you know if we think it's a good fit for our network of curators.",
	},
	{
		title: 'Select your reach',
		tag: 'Target',
		description:
			'Choose the genres that best describe your music and a budget that works for you. We will match your track with relevant playlists that are actively promoted by their curators.',
	},
	{
		title: 'Receive feedback',
		tag: 'Feedback',
		description:
			'Curators will review your track and provide feedback on what they think of your music, how you can improve your tracks, and/or tips for how to market your music going forward.',
	},
	{
		title: 'Get on playlists',
		tag: 'Place',
		description:
			'If curators like your track, they will add it to their playlists. You will receive feedback from all curators who review your track, regardless of whether or not they add it to their playlists.',
	},
	{
		title: 'Engage your new fans',
		tag: 'Engage',
		description:
			"After your campaign, we'll help you retarget an audience of engaged listeners who have already discovered your music.",
	},
];

const HowItWorks = () => {
	return (
		<div className='mt-16 flex flex-col items-center space-y-3 text-justify sm:mt-20'>
			<div className='max-w-2xl'>
				<AnimateOnScroll repeat fade slideFrom='bottom'>
					<H
						size='2'
						className='pb-6 text-center animate-in slide-in-from-top-0 sm:pb-10'
					>
						How it works
					</H>
				</AnimateOnScroll>

				<div className='mt-6 grid grid-cols-1 gap-8 sm:gap-16'>
					{items.map((item, index) => (
						<div key={index}>
							<AnimateOnScroll
								threshold={0}
								fade
								slideFrom={isEven(index) ? 'left' : 'left'}
								repeat
							>
								{/* <Card> */}
								<div className='flex flex-row'>
									<div className='min-w-[75px]'>
										<H size='2' className='mb-0 font-extralight text-pink-200 '>
											0{index + 1}
										</H>
										<Text variant='sm/semibold' className='uppercase text-pink-200'>
											{item.tag}
										</Text>
									</div>
									<div className='pl-4 pr-4 text-left sm:pl-20'>
										<H size='1' className='pb-4 '>
											{item.title}
										</H>
										<Text variant='lg/light' muted>
											{item.description}
										</Text>
									</div>
								</div>
								{/* </Card> */}
							</AnimateOnScroll>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export { HowItWorks };
