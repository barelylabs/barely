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
			<div className='flex flex-row sm:flex-row mt-20 sm:mt-30 space-x-3 sm:space-x-16 w-fit items-stretch'>
				<PhoneFrame size='md'>
					<Image
						src='/assets/playlist-pitch/playlist-placed-folk-escape.png'
						width='600'
						height='600'
						alt='alt'
						className={'device-screen'}
					/>
				</PhoneFrame>

				<div className='grid grid-cols-1 sm:hidden w-fit text-left max-w-2xl min-h-full'>
					<div className='grid grid-cols-1 gap-2'>
						{features.map((feature, index) => (
							<Card
								key={index}
								className='rounded-3xl bg-blue-500 bg-opacity-90 p-3 flex-grow-0'
							>
								<Text variant='sm/semibold' className='text-slate-200'>
									{feature.emoji} {feature.text}
								</Text>
							</Card>
						))}
					</div>
				</div>

				<div className='hidden sm:flex flex-col gap-3 w-fit text-left max-w-2xl min-h-full'>
					<H size='3' className='text-blue capitalize'>
						High-quality campaigns
					</H>
					<H size='1'>Submit your music to playlist curators</H>

					<div className='grid grid-cols-1 gap-2 mt-3'>
						{features.map((feature, index) => (
							<div key={index} className={`flex flex-row space-x-3 items-start`}>
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
