import { AnimateOnScroll } from '@barely/ui/elements/animate-on-scroll';
import { Card } from '@barely/ui/elements/card';
import { H1, H2, Text, Title } from '@barely/ui/elements/typography';

import { isEven } from '@barely/utils/edge/math';

const items = [
	{
		title: 'Submit your track',
		description:
			"Submit your music to our playlist pitching team. We will review your submission and let you know if we think it's a good fit for our network of curators.",
	},
	{
		title: 'Select your targeting & reach',
		description:
			'Choose the genres that best describe your music and a budget that works for you. We will match your track with relevant playlists that are actively promoted by their curators.',
	},
	{
		title: 'Get feedback',
		description:
			'Curators will review your track and provide feedback on what they think of your music, how you can improve your tracks, and/or tips for how to market your music going forward.',
	},
	{
		title: 'Get on playlists',
		description:
			'If curators like your track, they will add it to their playlists. You will receive feedback from all curators who review your track, regardless of whether or not they add it to their playlists.',
	},
	{
		title: 'Engage with your new fans',
		description:
			"After your campaign, we'll help you retarget an audience of engaged listeners who have already discovered your music.",
	},
];

const HowItWorks = () => {
	return (
		<div className='flex flex-col space-y-3 mt-20 items-center text-justify'>
			<div className='max-w-2xl'>
				<AnimateOnScroll repeat fade slideFrom='bottom'>
					<Title className='text-center animate-in slide-in-from-top-0'>
						How it works
					</Title>
				</AnimateOnScroll>

				<div className='grid grid-cols-1 gap-4 mt-6'>
					{items.map((item, index) => (
						<div key={index}>
							<AnimateOnScroll
								threshold={0}
								fade
								slideFrom={isEven(index) ? 'left' : 'left'}
								repeat
							>
								<Card>
									<div className='flex flex-row'>
										<Title>{index + 1}</Title>
										<div className='pl-10 pr-4'>
											<H2 className='pb-4'>{item.title}</H2>
											<Text variant='lg/light' muted>
												{item.description}
											</Text>
										</div>
									</div>
								</Card>
							</AnimateOnScroll>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export { HowItWorks };
