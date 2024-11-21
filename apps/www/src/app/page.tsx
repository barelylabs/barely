import type { Metadata } from 'next';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { Text } from '@barely/ui/elements/typography';

import { BentoCard } from '~/components/bento-card';
import { Button } from '~/components/button';
import { Container } from '~/components/container';
import { Footer } from '~/components/footer';
import { Gradient } from '~/components/gradient';
import { Keyboard } from '~/components/keyboard';
import { Link } from '~/components/link';
import { LinkedAvatars } from '~/components/linked-avatars';
import { LogoCloud } from '~/components/logo-cloud';
import { LogoCluster } from '~/components/logo-cluster';
import { LogoTimeline } from '~/components/logo-timeline';
import { Map } from '~/components/map';
import { Navbar } from '~/components/navbar';
import { Screenshot } from '~/components/screenshot';
import { Testimonials } from '~/components/testimonials';
import { Heading, Subheading } from '~/components/text';

export const metadata: Metadata = {
	description:
		'Radiant helps you sell more by revealing sensitive information about your customers.',
};

function Hero() {
	return (
		<div className='relative'>
			<Gradient className='rounded-4xl absolute inset-2 bottom-0 bg-gray-100 ring-1 ring-inset ring-black/5' />
			<Container className='relative'>
				<Navbar
				// banner={
				// 	<Link
				// 		href='/blog/radiant-raises-100m-series-a-from-tailwind-ventures'
				// 		className='flex items-center gap-1 rounded-full bg-fuchsia-950/35 px-3 py-0.5 text-sm/6 font-medium text-white data-[hover]:bg-fuchsia-950/30'
				// 	>
				// 		Radiant raises $100M Series A from Tailwind Ventures
				// 		<ChevronRightIcon className='size-4' />
				// 	</Link>
				// }
				/>
				<div className='pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32'>
					<h1 className='text-balance font-heading text-6xl/[0.9] font-medium tracking-tight text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]'>
						Build your fan base.
					</h1>
					<p className='mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8'>
						Open-source marketing tools, built for musicians.
					</p>
					<div className='mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row'>
						<Button href={getAbsoluteUrl('app', 'register')}>Get started</Button>
						<Button variant='secondary' href='/pricing'>
							See pricing
						</Button>
					</div>
				</div>
			</Container>
		</div>
	);
}

function FeatureSection() {
	return (
		<div className='overflow-hidden'>
			<Container className='pb-24'>
				<Heading as='h2' className='max-w-3xl'>
					A snapshot of your entire sales pipeline.
				</Heading>
				<Screenshot
					width={1216}
					height={768}
					src='/screenshots/app.png'
					className='mt-16 h-[36rem] sm:h-auto sm:w-[76rem]'
				/>
			</Container>
		</div>
	);
}

function LightBentoSection1() {
	return (
		<Container>
			<Subheading>Destinations</Subheading>
			<Heading as='h3' className='mt-2 max-w-3xl'>
				Send fans to the right place.
			</Heading>

			<div className='mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2'>
				<BentoCard
					icon='fm'
					eyebrow='FM Pages'
					title='Every streaming service in one place'
					description='Let your fans pick where they want to listen to your music. Easily create a new page for each release.'
					graphic={
						<div className='h-80 bg-[url(/screenshots/fm-md.png)] bg-[size:1000px_620px] bg-[left_-449px_top_-10px] bg-no-repeat sm:bg-[left_-339px_top_-10px]' />
					}
					fade={['bottom']}
					className='max-lg:rounded-t-4xl lg:rounded-tl-4xl lg:col-span-3'
				/>
				<BentoCard
					icon='link'
					eyebrow='Short Links'
					title='Shorten and track any URL'
					description='Turn any URL into a branded link that tracks clicks'
					graphic={
						// <div className='absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-[size:1100px_650px] bg-[left_-38px_top_-73px] bg-no-repeat' />
						<div className='absolute inset-0 bg-[url(/screenshots/links.png)] bg-[size:775px_775px] bg-[left_0px_top_-13px] bg-no-repeat' />
					}
					fade={['bottom']}
					className='lg:rounded-tr-4xl lg:col-span-3'
				/>
				{/* <BentoCard
					eyebrow='Speed'
					title='Built for power users'
					description='It’s never been faster to cold email your entire contact list using our streamlined keyboard shortcuts.'
					graphic={
						<div className='flex size-full pl-10 pt-10'>
							<Keyboard highlighted={['LeftCommand', 'LeftShift', 'D']} />
						</div>
					}
					className='lg:rounded-bl-4xl lg:col-span-2'
				/> */}
				<BentoCard
					icon='landingPage'
					eyebrow='Landing Pages'
					title='Easy to build, easy to share'
					description='Create a landing page in seconds. For offers, downloads, events & whatever else you need.'
					// graphic={
					// 	<div className='flex size-full pl-10 pt-10'>
					// 		<Keyboard highlighted={['LeftCommand', 'LeftShift', 'D']} />
					// 	</div>
					// }
					graphic={
						// <div className='absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-[size:1100px_650px] bg-[left_-38px_top_-73px] bg-no-repeat' />
						<div className='absolute inset-0 bg-[url(/screenshots/landing-page.png)] bg-[size:775px_628px] bg-[left_-175px_top_-10px] bg-no-repeat' />
					}
					fade={['bottom']}
					className='lg:rounded-bl-4xl lg:col-span-2'
				/>
				<BentoCard
					icon='pressKit'
					eyebrow='Press Kit'
					title='Press, simplified'
					description='A simple EPK. Everything you need for press, bookings, and more.'
					// graphic={<Map />}
					graphic={
						// <div className='absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-[size:1100px_650px] bg-[left_-38px_top_-73px] bg-no-repeat' />
						<div className='absolute inset-0 bg-[url(/screenshots/press.png)] bg-[size:450px_552px] bg-[left_-17px_top_-15px] bg-no-repeat' />
					}
					fade={['bottom']}
					className='max-lg:rounded-b-4xl lg:rounded-br-4xl lg:col-span-2'
				/>
				<BentoCard
					icon='bio'
					eyebrow='Artist Bio'
					comingSoon
					title='Every link in one place'
					description='Connect fans to all your content in a single Link in Bio'
					// graphic={<LogoCluster />}
					graphic={
						<div className='flex size-full items-center justify-center rounded-2xl bg-gray-400'>
							<Text variant='xl/normal' className='text-gray-950/75'>
								👷 Coming soon 🏗️
							</Text>
						</div>
					}
					fade={['bottom']}
					className='lg:col-span-2'
				/>
			</div>
		</Container>
	);
}

function DarkBentoSection() {
	return (
		<div className='rounded-4xl mx-2 mt-2 bg-gray-900 py-32'>
			<Container>
				<Subheading dark>Fan base management</Subheading>
				<Heading as='h3' dark className='mt-2 max-w-3xl'>
					Build a <span className='underline'>lasting relationship</span>.
				</Heading>

				<div className='mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2'>
					<BentoCard
						dark
						icon='broadcast'
						eyebrow='Broadcasts'
						title='Sell at the speed of light'
						description="Our RadiantAI chat assistants analyze the sentiment of your conversations in real time, ensuring you're always one step ahead."
						graphic={
							<div className='h-80 bg-[url(/screenshots/networking.png)] bg-[size:851px_344px] bg-no-repeat' />
						}
						fade={['top']}
						className='max-lg:rounded-t-4xl lg:rounded-tl-4xl lg:col-span-4'
					/>
					<BentoCard
						dark
						icon='flow'
						eyebrow='flows'
						title='Flow & Drip Sequences'
						description='Build & send sequences of emails to your fans. Take them on a journey through your catalog, new releases, and more.'
						graphic={<LogoTimeline />}
						// `!overflow-visible` is needed to work around a Chrome bug that disables the mask on the graphic.
						className='lg:rounded-tr-4xl z-10 !overflow-visible lg:col-span-2'
					/>
					<BentoCard
						dark
						eyebrow='Meetings'
						title='Smart call scheduling'
						description="Automatically insert intro calls into your leads' calendars without their consent."
						graphic={<LinkedAvatars />}
						className='lg:rounded-bl-4xl lg:col-span-2'
					/>
					<BentoCard
						dark
						eyebrow='Engagement'
						title='Become a thought leader'
						description='RadiantAI automatically writes LinkedIn posts that relate current events to B2B sales, helping you build a reputation as a thought leader.'
						graphic={
							<div className='h-80 bg-[url(/screenshots/engagement.png)] bg-[size:851px_344px] bg-no-repeat' />
						}
						fade={['top']}
						className='max-lg:rounded-b-4xl lg:rounded-br-4xl lg:col-span-4'
					/>
				</div>
			</Container>
		</div>
	);
}

export default function Home() {
	return (
		<div className='overflow-hidden'>
			<Hero />
			<main>
				<Container className='mt-10'>
					<LogoCloud />
				</Container>
				<div className='bg-gradient-to-b from-white from-50% to-gray-100 py-32'>
					{/* <FeatureSection /> */}
					<LightBentoSection1 />
				</div>
				<DarkBentoSection />
			</main>
			<Testimonials />
			<Footer />
		</div>
	);
}
