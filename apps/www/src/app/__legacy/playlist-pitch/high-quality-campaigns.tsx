import Image from 'next/image';

import { AnimateOnScroll } from '@barely/ui/elements/animate-on-scroll';
import { Button } from '@barely/ui/elements/button';
import { Card } from '@barely/ui/elements/card';
import { PhoneFrame } from '@barely/ui/elements/phone-frame';
import { H, Text } from '@barely/ui/elements/typography';

const features = [
	{ emoji: '🤝', text: 'Connect with curators instantly' },
	{ emoji: '🤖', text: 'Trigger the Spotify algorithm' },
	{ emoji: '🎯', text: 'Build a retargetable base of engaged listeners' },
	{ emoji: '🚀', text: 'Launch your marketing strategy' },
];

const Features = () => {
	return (
		<AnimateOnScroll fade slideFrom='bottom'>
			<div className='sm:mt-30 mt-20 flex w-fit flex-row items-stretch space-x-3 sm:flex-row sm:space-x-16'>
				<PhoneFrame size='md'>
					<Image
						src='/assets/playlist-pitch/playlist-placed-folk-escape.png'
						width='600'
						height='600'
						alt='alt'
						className={'device-screen'}
					/>
				</PhoneFrame>

				<div className='grid min-h-full w-fit max-w-2xl grid-cols-1 text-left sm:hidden'>
					<div className='grid grid-cols-1 gap-2'>
						{features.map((feature, index) => (
							<Card
								key={index}
								className='flex-grow-0 rounded-3xl bg-blue-500 bg-opacity-90 p-3'
							>
								<Text variant='sm/semibold' className='text-slate-200'>
									{feature.emoji} {feature.text}
								</Text>
							</Card>
						))}
					</div>
				</div>

				<div className='hidden min-h-full w-fit max-w-2xl flex-col gap-3 text-left sm:flex'>
					<H size='3' className='capitalize text-blue'>
						High-quality campaigns
					</H>
					<H size='1'>Submit your music to playlist curators</H>

					<div className='mt-3 grid grid-cols-1 gap-2'>
						{features.map((feature, index) => (
							<div key={index} className={`flex flex-row items-start space-x-3`}>
								<Text variant='2xl/medium' muted>
									{feature.emoji}
								</Text>
								<Text variant='2xl/medium' muted>
									{feature.text}
								</Text>
							</div>
						))}
					</div>

					<div className='flex flex-1 items-end '>
						<Button
							className='mb-1'
							size='lg'
							pill
							href='https://app.barely.io/playlist-pitch'
						>
							Start campaign
						</Button>
					</div>
					{/* </Card> */}
				</div>
			</div>
		</AnimateOnScroll>
	);
};

export { Features };
