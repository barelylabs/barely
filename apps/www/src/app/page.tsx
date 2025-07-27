import type { Metadata } from 'next';
import { BarChart3, Beaker, Code2 } from 'lucide-react';

import { Text } from '@barely/ui/typography';

import { AnimatedSection } from '~/components/animated-section';
import { BentoCard } from '~/components/bento-card';
import { Container } from '~/components/container';
import { CostCalculator } from '~/components/cost-calculator';
import { FAQSection } from '~/components/faq-section';
import { Hero } from '~/components/hero';
import { HowItWorksSection } from '~/components/how-it-works-section';
import { LinkedAvatars } from '~/components/linked-avatars';
import { ProblemSolutionSection } from '~/components/problem-solution-section';
import { Heading, Subheading } from '~/components/text';
import { ValueCard } from '~/components/value-card';

// import { LogoCloud } from '~/components/logo-cloud';
// import { SocialProof } from '~/components/social-proof';

export const metadata: Metadata = {
	description:
		'The open-source marketing platform built specifically for musicians. Smart links, email marketing, landing pages, merch sales, and unified analytics - all integrated, all transparent.',
};

function ValuePropsSection() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<h2 className='mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
						Why musicians choose{' '}
						<span className='gradient-text inline-block'>barely.io</span>
					</h2>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-3'>
					<AnimatedSection animation='fade-up' delay={100}>
						<ValueCard
							icon={<Beaker className='h-6 w-6' />}
							title='Engineered for Music'
							description='Not business tools adapted for musicians. Every feature designed specifically for releases, tours, fan relationships, and the unique way music careers grow.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<ValueCard
							icon={<Code2 className='h-6 w-6' />}
							title='Open Source & Transparent'
							description='See exactly how everything works. No black boxes, no vendor lock-in. Built by musicians who believe artists deserve to understand their tools.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<ValueCard
							icon={<BarChart3 className='h-6 w-6' />}
							title='Complete Integration'
							description='Your smart links, emails, landing pages, and merch sales all work together seamlessly. See the full picture of how your music reaches fans and drives results.'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

// function FeatureSection() {
// 	return (
// 		<div className='overflow-hidden'>
// 			<Container className='pb-24'>
// 				<Heading as='h2' className='max-w-3xl'>
// 					A snapshot of your entire sales pipeline.
// 				</Heading>
// 				<Screenshot
// 					width={1216}
// 					height={768}
// 					src='/screenshots/app.png'
// 					className='mt-16 h-[36rem] sm:h-auto sm:w-[76rem]'
// 				/>
// 			</Container>
// 		</div>
// 	);
// }

function DestinationsBentoSection() {
	return (
		<div className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<Subheading>Smart Links & Destinations</Subheading>
					<Heading as='h3' className='mt-2 max-w-3xl text-white'>
						Replace expensive link tools with{' '}
						<span className='gradient-text whitespace-nowrap'>
							integrated alternatives
						</span>
						.
					</Heading>
				</AnimatedSection>

				<div className='mt-10 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-12 lg:grid-rows-2'>
					<AnimatedSection
						animation='fade-up'
						delay={100}
						className='lg:col-span-6 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='fm'
							eyebrow='Smart Links (Replaces Linkfire)'
							title='Every streaming service in one place'
							description='Create smart links for your releases that adapt to each fan. Track real conversions, not just clicks.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/fm-md.png)] bg-[size:1000px_620px] bg-[left_-449px_top_-10px] bg-no-repeat sm:bg-[left_-339px_top_-10px]' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={150}
						className='lg:col-span-6 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='link'
							eyebrow='Short Links'
							title='Track every click with context'
							description='Branded short links for every campaign. Track if that blog feature, influencer post, or press coverage is actually bringing in fans.'
							graphic={
								<div className='absolute inset-0 bg-[url(/screenshots/links.png)] bg-[size:775px_775px] bg-[left_0px_top_-13px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={200}
						className='lg:col-span-4 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='landingPage'
							eyebrow='Landing Pages (Replaces Squarespace)'
							title='Fast pages that convert'
							description='Turn announcement hype into email subscribers. Perfect for new releases, tour dates, and exclusive drops.'
							graphic={
								<div className='absolute inset-0 bg-[url(/screenshots/landing-page.png)] bg-[size:775px_628px] bg-[left_-175px_top_-10px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={250}
						className='lg:col-span-4 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='pressKit'
							eyebrow='Electronic Press Kit'
							title='Professional EPKs in minutes'
							description='Create stunning press kits that get you booked. Everything venues and press need in one place.'
							graphic={
								<div className='absolute inset-0 bg-[url(/screenshots/press.png)] bg-[size:450px_552px] bg-[left_-17px_top_-15px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={300}
						className='lg:col-span-4 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='bio'
							eyebrow='Link in Bio'
							title='All your links, one place'
							description='Replace Linktree with a link-in-bio that actually captures fan data and drives conversions.'
							graphic={
								<div className='glass flex size-full items-center justify-center rounded-2xl'>
									<Text variant='xl/normal' className='text-white/75'>
										Coming soon
									</Text>
								</div>
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</div>
	);
}

function FanbaseBentoSection() {
	return (
		<div className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<Subheading>Email Marketing & Automation</Subheading>
					<Heading as='h3' className='mt-2 max-w-3xl text-white'>
						Replace ConvertKit & Mailchimp with{' '}
						<span className='gradient-text inline-block'>music-specific tools</span>.
					</Heading>
				</AnimatedSection>

				<div className='mt-10 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-12 lg:grid-rows-2'>
					<AnimatedSection
						animation='fade-up'
						delay={100}
						className='lg:col-span-7 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='broadcast'
							eyebrow='Email Campaigns'
							title='Broadcasts that resonate'
							description='Send targeted emails based on listening behavior, location, and engagement. Know exactly who opens, clicks, and converts.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/email-broadcast.png)] bg-[size:851px_851px] bg-[left_0px_top_-320px] bg-no-repeat' />
							}
							fade={['top']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={150}
						className='lg:col-span-5 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='fanGroup'
							eyebrow='Smart Segmentation'
							title='Know your superfans'
							description='Automatically segment fans by streaming behavior, purchase history, location, and engagement levels.'
							graphic={<LinkedAvatars />}
							className='z-10 h-full !overflow-visible'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={200}
						className='lg:col-span-4 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='emailTemplateGroup'
							eyebrow='Reusable Templates'
							title='Music-specific templates'
							description='Pre-built templates for releases, tours, and merch drops. Customize once, use forever.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/email-groups.png)] bg-[size:592px_344px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={250}
						className='lg:col-span-8 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='flow'
							eyebrow='Marketing Automation (Replaces Zapier)'
							title='Set it and forget it'
							description='Trigger email sequences based on streaming milestones, tour dates, and fan behavior. No more manual work.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/flow-builder.png)] bg-[size:1000px_612px] bg-[left_-350px_top_-20px] bg-no-repeat sm:bg-[left_-10px_top_-20px] md:bg-[left_-10px_top_-20px]' />
							}
							fade={['top']}
							className='h-full'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</div>
	);
}

function CartBentoSection() {
	return (
		<div className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<Subheading>Direct Sales & Monetization</Subheading>
					<Heading as='h3' className='mt-2 max-w-3xl text-white'>
						Replace Shopify & Big Cartel with{' '}
						<span className='gradient-text inline-block'>integrated commerce</span>.
					</Heading>
				</AnimatedSection>

				<div className='mt-10 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-12 lg:grid-rows-2'>
					<AnimatedSection
						animation='fade-up'
						delay={100}
						className='lg:col-span-8 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='cart'
							eyebrow='Merch & Digital Sales'
							title='Sell directly to fans'
							description='Sell vinyl, merch, and exclusive tracks directly to fans. Track what converts listeners into buyers.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/cart-builder.png)] bg-[size:851px_851px] bg-[left_-10px_top_-175px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={150}
						className='lg:col-span-4 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='bump'
							eyebrow='Order Bumps'
							title='Boost every purchase'
							description='One-click to add stickers or another CD. The easiest way to double your order value.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/cart-bump.png)] bg-[size:351px_351px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='z-10 h-full !overflow-visible'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={200}
						className='lg:col-span-5 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='upsell'
							eyebrow='Post-Purchase Upsells'
							title='The perfect thank you'
							description='Turn a CD buyer into a signed vinyl collector. Exclusive post-purchase offers that triple order value.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/cart-upsell.png)] bg-[size:551px_400px] bg-[left_-70px_top_-0px] bg-no-repeat' />
							}
							className='h-full'
						/>
					</AnimatedSection>
					<AnimatedSection
						animation='fade-up'
						delay={250}
						className='lg:col-span-7 lg:row-span-1'
					>
						<BentoCard
							dark
							icon='fulfillment'
							eyebrow='Automated Fulfillment'
							title='Ship without the hassle'
							description='Integrated order management and tracking. Focus on making music, not packing boxes.'
							graphic={
								<div className='h-80 bg-[url(/screenshots/cart-orders.png)] bg-[size:851px_567px] bg-[left_-10px_top_-10px] bg-no-repeat' />
							}
							fade={['bottom']}
							className='h-full'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</div>
	);
}

function BuiltByBarelySection() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-3xl text-center'>
					<Subheading>Built by Barely</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						The Same Tools We Use for{' '}
						<span className='gradient-text inline-block'>
							Professional Music Marketing
						</span>
					</Heading>
					<p className='mt-6 text-lg text-muted-foreground'>
						barely.io powers the marketing campaigns at Barely, where we've helped indie
						artists grow from 0 to 30K+ monthly listeners. Every feature was built to
						solve real problems we encountered in professional music marketing.
					</p>
					<p className='mt-4 text-lg text-muted-foreground'>
						Now you get the exact same tools we use for agency clients - transparent,
						integrated, and engineered specifically for how music careers actually grow.
					</p>
				</AnimatedSection>
			</Container>
		</section>
	);
}

export default function Home() {
	return (
		<div className='overflow-hidden'>
			{/* Hero */}
			<Hero />

			<main>
				{/* Logo Cloud */}
				{/* <Container className='py-16'>
					<AnimatedSection animation="fade-up">
						<p className="mb-8 text-center text-sm text-muted-foreground">
							Trusted by thousands of independent artists worldwide
						</p>
						<LogoCloud />
					</AnimatedSection>
				</Container> */}

				{/* Value Props */}
				<ValuePropsSection />

				{/* Problem/Solution */}
				<ProblemSolutionSection />

				{/* How It Works */}
				<HowItWorksSection />

				{/* Features */}
				<DestinationsBentoSection />

				<FanbaseBentoSection />

				<CartBentoSection />

				{/* Cost Calculator */}
				<section className='py-24'>
					<Container>
						<CostCalculator />
					</Container>
				</section>

				{/* Social Proof - Commented out until we have real data */}
				{/* <SocialProof /> */}

				{/* Built by Barely */}
				<BuiltByBarelySection />

				{/* FAQ Section */}
				<FAQSection />
			</main>
		</div>
	);
}
