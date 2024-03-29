import { FiActivity, FiTarget } from 'react-icons/fi';
import { GiConvergenceTarget } from 'react-icons/gi';
import { GoGlobe } from 'react-icons/go';
import {
	MdOutlineFingerprint,
	MdOutlinePreview,
	MdQrCode,
	MdTouchApp,
} from 'react-icons/md';
import { RiPagesLine } from 'react-icons/ri';

import { FeatureCard } from '@barely/ui/elements/card';
import { TimelineVertical } from '@barely/ui/elements/timeline';
import { H, Text } from '@barely/ui/elements/typography';

const Heading = () => {
	return (
		<div className='m-auto flex w-fit flex-col pb-7 pt-20'>
			<H size='1' className=' pb-9'>
				{`Build your fan's journey.`}
			</H>

			<div className='flex flex-row space-x-4 text-xl font-semibold text-gray-50 sm:m-auto'>
				<a href='#brand' className='rounded-xl bg-red-500 px-5 py-3 '>
					brand
				</a>
				<a href='#track' className='rounded-xl bg-green-500 px-5 py-3 '>
					track
				</a>
				<a href='#grow' className='rounded-xl bg-blue-500 px-5 py-3  '>
					grow
				</a>
			</div>
		</div>
	);
};

const Brand = () => {
	return (
		<div className='flex flex-col space-y-4 '>
			<H size='2'>Brand</H>
			<H size='3'>Tell your story</H>
			<Text muted>
				Build trust and increase brand recognition across all channels to create a
				memorable (and profitable) customer journey - without need to cobble together and
				rely on third-party tools.
			</Text>
			<FeatureCard Icon={MdOutlineFingerprint} iconColor='red' headline='Branded Links'>
				Build trust and create a lasting impression with personally branded URLs.
			</FeatureCard>
			<FeatureCard Icon={MdQrCode} iconColor='green' headline='Branded QR Codes'>
				Reduce friction for mobile users with page-specific QR codes.
			</FeatureCard>
			<FeatureCard
				Icon={MdOutlinePreview}
				iconColor='blue'
				headline='Custom Link Preview'
			>
				Generate the perfect Link Preview for any social.
			</FeatureCard>
		</div>
	);
};

const Track = () => {
	return (
		<div className='flex flex-col space-y-4'>
			<H size='2'>Track</H>
			<H size='3'>Make data-driven decisions</H>
			<Text muted>
				Track clicks, monitor engagement, and gain insights into the performance of your
				campaigns in real-time. Our friendly dashboard helps you make data-driven
				decisions and optimize your marketing strategies for optimal results.
			</Text>
			<FeatureCard
				Icon={GiConvergenceTarget}
				iconColor='red'
				headline='Conversion Tracking'
			>
				Track your sales and key conversions across all channels.
			</FeatureCard>
			<FeatureCard Icon={GoGlobe} iconColor='green' headline='Geotargeting' />
			Booking gigs for a tour or need to know which stores should stock your upcoming
			vinyl? Learn where your fans are and target those areas.
			<FeatureCard Icon={FiActivity} iconColor='blue' headline='Activity Monitoring'>
				Have confidence that your links are active.
			</FeatureCard>
		</div>
	);
};

const Grow = () => {
	return (
		<div className='flex flex-col space-y-4'>
			<H size='2'>Grow</H>
			<H size='3'>Generate more conversions</H>
			<Text muted>
				Scale your business and fanbase with a suite of tools designed to lower your cost
				per sale, increase average order value, and generate happy fans who can’t stop
				talking about you.
			</Text>

			<FeatureCard Icon={MdTouchApp} iconColor='red' headline='Easy app linking'>
				Take users straight to the content you want them to see within the most popular
				apps.
			</FeatureCard>
			<FeatureCard Icon={FiTarget} iconColor='green' headline='Retargeting'>
				Craft your fan’s journey and build a relationship.
			</FeatureCard>
			<FeatureCard Icon={RiPagesLine} iconColor='blue' headline='barely.bio'>
				Optimize your social media bios with one link to all of your content.
			</FeatureCard>
		</div>
	);
};

const BuildYourJourney = () => {
	return (
		<div
			id='how-it-works'
			className='flex max-w-4xl flex-col space-y-4 px-6 pb-32  pt-12 md:m-auto'
		>
			<Heading />
			<TimelineVertical
				points={[
					{ id: 'brand', content: <Brand />, color: 'red' },
					{ id: 'track', content: <Track />, color: 'green' },
					{ id: 'grow', content: <Grow />, color: 'blue' },
				]}
			/>
		</div>
	);
};

export default BuildYourJourney;
