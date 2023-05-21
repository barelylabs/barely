import Image from 'next/image';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { PhoneFrame } from '@barely/ui/elements/phone-frame';
import { H1, H3, Text } from '@barely/ui/elements/typography';

const features = [
	'Connect with playlist curators instantly',
	'Trigger the Spotify algorithm',
	'Build a retargetable fanbase of engaged listeners',
	'Launch your overall marketing strategy',
];

const Features = () => {
	return (
		<div className='flex flex-col sm:flex-row mt-20 space-x-16 w-fit items-stretch'>
			<PhoneFrame size='md'>
				<Image
					src='/assets/playlist-pitch/playlist-placed-folk-escape.png'
					width='600'
					height='600'
					alt='alt'
					className={'device-screen'}
				/>
			</PhoneFrame>

			<div className='flex flex-col gap-3 w-fit text-left max-w-2xl min-h-full'>
				<H3 className='text-blue capitalize'>High-quality campaigns</H3>
				<H1>Submit your music to playlist curators</H1>

				<div className='grid grid-cols-1 gap-2 mt-3'>
					{features.map((feature, index) => (
						<div key={index} className={`flex flex-row space-x-3 items-center`}>
							<Icon.checkCircle size='20' className='flex-0' />
							<Text variant='2xl/semibold'>{feature}</Text>
						</div>
					))}
				</div>

				<div className='flex flex-1 items-end '>
					<Button className='mb-1' size='lg' pill>
						Start campaign
					</Button>
				</div>
				{/* </Card> */}
			</div>
		</div>
	);
};

export { Features };
