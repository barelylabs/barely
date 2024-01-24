import {
	MdOutlineFingerprint,
	MdOutlinePreview,
	MdQrCode,
	MdTouchApp,
} from 'react-icons/md';
// import { FeatureCard, TimelineVertical } from '@barely/ui';
import { GiConvergenceTarget } from 'react-icons/gi';
import { GoGlobe } from 'react-icons/go';
import { FiActivity, FiTarget } from 'react-icons/fi';
import { RiPagesLine } from 'react-icons/ri';
// import { FeatureCard, TimelineVertical } from '@barely/ui';
import { FeatureCard } from '@barely/ui/src/FeatureCard';
import { TimelineVertical } from '@barely/ui/src/TimelineVertical';

const Heading = () => {
	return (
		<div className='m-auto flex w-fit flex-col pt-8 pb-7'>
			<h2 className=' pb-9 text-5xl font-semibold text-gray-800'>
				Build your fan's journey.
			</h2>

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
			<h2 className='align-top text-4xl font-semibold leading-none text-gray-800'>
				Brand
			</h2>
			<h3 className='text-2xl font-semibold text-gray-700'>Tell your story</h3>
			<p className='text-md text-left  text-gray-600'>
				Build trust and increase brand recognition across all channels to create a
				memorable (and profitable) customer journey - without need to cobble together and
				rely on third-party tools.
			</p>
			<FeatureCard
				Icon={MdOutlineFingerprint}
				iconColor='red'
				headline='Branded Links'
				children='Build trust and create a lasting impression with personally branded URLs.'
			/>
			<FeatureCard
				Icon={MdQrCode}
				iconColor='green'
				headline='Branded QR Codes'
				children='Reduce friction for mobile users with page-specific QR codes.'
			/>
			<FeatureCard
				Icon={MdOutlinePreview}
				iconColor='green'
				headline='Custom Link Preview'
				children='Generate the perfect Link Preview for any social.'
			/>
		</div>
	);
};

const Track = () => {
	return (
		<div className='flex flex-col space-y-4'>
			<h2 className='text-4xl font-semibold text-gray-800'>Track</h2>
			<h3 className='text-2xl font-semibold text-gray-700'>Make data-driven decisions</h3>
			<p className='text-md text-left  text-gray-600'>
				Track clicks, monitor engagement, and gain insights into the performance of your
				campaigns in real-time. Our friendly dashboard helps you make data-driven
				decisions and optimize your marketing strategies for optimal results.
			</p>

			<FeatureCard
				Icon={GiConvergenceTarget}
				iconColor='red'
				headline='Conversion Tracking'
				children='Track your sales and key conversions across all channels.'
			/>
			<FeatureCard
				Icon={GoGlobe}
				iconColor='green'
				headline='Geotargeting'
				children='Booking gigs for a tour or need to know which stores should stock your upcoming vinyl? Learn where your fans are and target those areas.'
			/>
			<FeatureCard
				Icon={FiActivity}
				iconColor='blue'
				headline='Activity Monitoring'
				children='Have confidence that your links are active.'
			/>
		</div>
	);
};

const Grow = () => {
	return (
		<div className='flex flex-col space-y-4'>
			<h2 className='text-4xl font-semibold text-gray-800'>Grow</h2>
			<h3 className='text-2xl font-semibold text-gray-700'>Generate more conversions</h3>
			<p className='text-md text-left  text-gray-600'>
				Scale your business and fanbase with a suite of tools designed to lower your cost
				per sale, increase average order value, and generate happy fans who can’t stop
				talking about you.
			</p>

			<FeatureCard
				Icon={MdTouchApp}
				iconColor='red'
				headline='Easy app linking'
				children='Take users straight to the content you want them to see within the most popular apps.'
			/>
			<FeatureCard
				Icon={FiTarget}
				iconColor='green'
				headline='Retargeting'
				children='Craft your fan’s journey and build a relationship.'
			/>
			<FeatureCard
				Icon={RiPagesLine}
				iconColor='blue'
				headline='barely.bio'
				children='Optimize your social media bios with one link to all of your content.'
			/>
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
