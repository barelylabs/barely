import { BsClipboardCheck, BsFillPinMapFill } from 'react-icons/bs';
import { FaLink } from 'react-icons/fa';
import { MdPrivacyTip } from 'react-icons/md';

import { Tooltip } from '@barely/ui/tooltip';
import { H, Text } from '@barely/ui/typography';

const features = [
	{
		icon: BsFillPinMapFill,
		name: 'Transparent destinations',
		description:
			'Links are fully informative at first glance, containing all relevant details of the redirect destination.',
	},
	{
		icon: FaLink,
		name: 'Permanent links',
		description:
			'All app link redirects are permanent. Once a link is created, it cannot be deleted and the destination cannot be changed.',
	},
	{
		icon: BsClipboardCheck,
		name: 'Ad policy compliant',
		description:
			'Our links are fully compliant with the Advertising Policies of Meta, TikTok, and Spotify.',
	},
	{
		icon: MdPrivacyTip,
		name: 'Privacy',
		description:
			'Our service is fully compliant with all relevant privacy laws and regulations. ',
	},
];

const MadeForMarketing = () => {
	return (
		<div
			id='marketing'
			className='m-auto flex w-full flex-col place-items-center py-16 sm:py-20 lg:py-28'
		>
			<div className='space-y-4mx-auto flex max-w-5xl flex-col items-center px-6 lg:px-8'>
				<H size='1' className='pb-12'>
					Made For Marketing
				</H>
				<H size='3' className='text-3xl font-semibold text-gray-200'>
					<Tooltip content="The artist's handle" className='bg-red fill-red text-gray-50'>
						<button className='text-red'>{`{artist}`}</button>
					</Tooltip>
					<span className='text-gray-200'>.barely.link</span>/
					<Tooltip
						className='bg-green fill-green text-gray-50'
						content='The app the link redirects to (e.g. Spotify)'
					>
						<button className='text-green'>{`{app}`}</button>
					</Tooltip>
					/
					<Tooltip
						className='bg-blue fill-blue text-gray-50'
						content="The route in the app the link redirects to (e.g. 'playlist')"
					>
						<button className='text-blue'>{`{appRoute}`}</button>
					</Tooltip>
					/
					<Tooltip
						className='bg-purple fill-purple text-gray-50'
						content="The ID of the app route (e.g. '37i9dQZF1DXcBWIGoYBM5M')"
					>
						<button className='text-purple-400'>{`{appId}`}</button>
					</Tooltip>
				</H>
				<Text variant='sm/normal' className='py-5' muted>
					👆 hover for more info
				</Text>

				<div className='mt-16 max-w-lg sm:mx-auto md:max-w-none'>
					<div className='grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-12 md:gap-y-16'>
						{features.map(feature => (
							<div
								key={feature.name}
								className='relative flex flex-col gap-6 sm:flex-row md:flex-col lg:flex-row'
							>
								<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-gray-50 sm:shrink-0'>
									<feature.icon className='h-8 w-8' aria-hidden='true' />
								</div>
								<div className='sm:min-w-0 sm:flex-1'>
									<Text variant='lg/semibold'>{feature.name}</Text>
									<Text variant='md/normal' muted className='mt-2'>
										{feature.description}
									</Text>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MadeForMarketing;
