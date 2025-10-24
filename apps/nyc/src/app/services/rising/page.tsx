'use client';

import Link from 'next/link';
import { NYC_RISING_PLUS } from '@barely/const';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { PricingCard } from '../../../components/marketing/pricing-card';
import { useContactModal } from '../../../contexts/contact-modal-context';

// export const metadata: Metadata = {
// 	title: 'Rising+ Service - Professional Campaign Engineering | Barely NYC',
// 	description:
// 		'Brooklyn-based music marketing engineers for artists with 10-50K monthly listeners (or ready to jumpstart). We design and execute your campaigns with scientific precision.',
// };

export default function RisingPlusPage() {
	const { open: openContactModal } = useContactModal();
	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<div className='mb-4 space-y-1'>
							<span className='block text-sm font-medium text-purple-300'>
								First Month Special
							</span>
							<div className='flex items-center justify-center gap-2'>
								<span className='text-2xl text-white/40 line-through'>
									${NYC_RISING_PLUS.price.monthly.amount}
								</span>
								<span className='text-xl font-semibold text-purple-300 md:text-2xl'>
									${NYC_RISING_PLUS.promotionalPrice?.firstMonth}/month
								</span>
							</div>
						</div>
						<H
							size='1'
							className='gradient-text mb-6 pb-2 font-heading text-5xl leading-none md:text-6xl lg:text-7xl'
						>
							Rising+
						</H>
						<p className='mb-4 text-2xl text-white md:text-3xl'>
							Professional Campaign Engineering
						</p>
						<p className='text-lg text-white/70'>
							Perfect for artists with 10-50K monthly listeners (or ready to jumpstart) •
							Full execution + reporting
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Intro Section */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='glass mb-12 rounded-2xl p-8'>
							<H size='3' className='mb-6 text-2xl md:text-3xl'>
								Ready to Accelerate Your Growth? Let us do the heavy lifting.
							</H>
							<p className='mb-4 text-lg leading-relaxed text-white/80'>
								Whether you&apos;re steadily growing past 10K monthly listeners or
								you&apos;re under 10K with budget ready to jumpstart your results, Rising+
								gives you professional campaign execution without the black-box mystery.
							</p>
							<p className='text-xl font-semibold text-white'>
								You create the music. We engineer the growth.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* What You Get */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What You Get
						</H>
					</AnimatedSection>

					<div className='space-y-8'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🚀</span>
									<div>
										<H size='5' className='mb-2'>
											Up to 2 Professional Campaigns Per Month
										</H>
										<p className='text-white/70'>
											We design, execute, and optimize complete marketing campaigns based
											on your goals and budget. You approve the strategy, we handle all
											the technical implementation.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>💰</span>
									<div>
										<H size='5' className='mb-2'>
											Expert Management of Up to $3,000 Monthly Ad Spend
										</H>
										<p className='text-white/70'>
											Your $1-3K monthly budget working efficiently across platforms, with
											real-time optimization and detailed attribution tracking. No wasted
											spend, no black-box reporting.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛒</span>
									<div>
										<H size='5' className='mb-2'>
											Merch Strategy + Revenue Optimization
										</H>
										<p className='text-white/70'>
											Direct-to-fan sales platform plus active strategy development.
											Physical merch can return 50-90% immediately vs. 2% for streaming -
											we&apos;ll help you build campaigns that convert listeners into
											buyers, not just streams.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={500}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛠️</span>
									<div>
										<H size='5' className='mb-2'>
											Full Access to barely.ai Tools (Rising Tier Included)
										</H>
										<p className='text-white/70'>
											Advanced marketing automation, detailed analytics, and campaign
											management tools - all included free. Everything we use to run your
											campaigns, you can see and understand.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={600}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>📊</span>
									<div>
										<H size='5' className='mb-2'>
											1-hr Monthly Strategy Call with Performance Analysis
										</H>
										<p className='text-white/70'>
											In-depth sessions where we review exactly what worked, what
											didn&apos;t, and why. You&apos;ll see the data behind every decision
											and understand the methodology for your next campaigns.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={700}>
							<div className='glass rounded-xl p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>📈</span>
									<div>
										<H size='5' className='mb-2'>
											Campaign Optimization Based on Real-Time Data
										</H>
										<p className='text-white/70'>
											Continuous monitoring and adjustment of your campaigns using
											attribution modeling and performance analytics. Your campaigns get
											better throughout the month, not just at the end.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* The Process */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							The Process: Strategic Partnership
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='slide-right' delay={200}>
							<div className='flex gap-4'>
								<div className='w-36 flex-shrink-0 font-bold text-purple-300'>
									Campaign Planning:
								</div>
								<p className='text-white/80'>
									We analyze your goals, audience data, and budget to design optimal
									campaigns
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={300}>
							<div className='flex gap-4'>
								<div className='w-36 flex-shrink-0 font-bold text-purple-300'>
									Execution:
								</div>
								<p className='text-white/80'>
									Full technical implementation - ad setup, landing pages, automation
									sequences, tracking
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={400}>
							<div className='flex gap-4'>
								<div className='w-36 flex-shrink-0 font-bold text-purple-300'>
									Monitoring:
								</div>
								<p className='text-white/80'>
									Daily optimization based on performance data and algorithm changes
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={500}>
							<div className='flex gap-4'>
								<div className='w-36 flex-shrink-0 font-bold text-purple-300'>
									Reporting:
								</div>
								<p className='text-white/80'>
									Detailed monthly analysis showing exactly what drove results and why
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={600}>
							<div className='flex gap-4'>
								<div className='w-36 flex-shrink-0 font-bold text-purple-300'>
									Strategy Evolution:
								</div>
								<p className='text-white/80'>
									Each campaign informs the next, building compound growth over time
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Perfect For */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Perfect For:
						</H>
					</AnimatedSection>

					<div className='space-y-4'>
						{[
							'Artists with 10-50K monthly listeners ready for professional amplification',
							'Smaller artists (under 10K) with $1-3K monthly budgets who want to jumpstart growth',
							'Musicians generating consistent content (or ready to start)',
							'Bands tired of managing technical campaign details themselves',
							'Artists who want transparency without having to do the work',
						].map((item, index) => (
							<AnimatedSection key={index} animation='fade-up' delay={200 + index * 100}>
								<div className='flex items-start gap-3'>
									<span className='mt-0.5 text-xl text-green-500'>✓</span>
									<p className='text-lg text-white/80'>{item}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* What Makes Rising+ Different */}
			{/* <section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What Makes Rising+ Different
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='mb-8 text-center text-lg text-white/80'>
							Unlike agencies that charge similar rates while hiding their methods:
						</p>
					</AnimatedSection>

					<div className='space-y-4'>
						{[
							'Complete transparency about strategy, spend allocation, and results',
							'Tools built in-house by a PhD scientist, not rented from third parties',
							'Monthly education sessions so you understand what&apos;s working',
							'Open-source platform means you can see exactly how campaigns operate',
							'No guaranteed stream counts or fake playlist placements',
						].map((item, index) => (
							<AnimatedSection key={index} animation='fade-up' delay={300 + index * 100}>
								<div className='flex items-start gap-3'>
									<span className='mt-0.5 text-xl text-green-500'>✅</span>
									<p className='text-lg text-white/80'>{item}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section> */}
			{/* Pricing CTA */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-md'>
					<AnimatedSection animation='scale'>
						<PricingCard
							title={NYC_RISING_PLUS.name}
							price={`$${NYC_RISING_PLUS.promotionalPrice?.firstMonth}`}
							originalPrice={`$${NYC_RISING_PLUS.price.monthly.amount}`}
							description={NYC_RISING_PLUS.marketingDescription ?? ''}
							features={[
								'Up to 2 professional campaigns per month',
								'Management of $1-3K monthly ad spend',
								'Full access to barely.ai tools (Rising tier)',
								'Monthly strategy calls with analysis',
								'Merch strategy + revenue optimization',
								'Real-time campaign optimization',
							]}
							ctaText='Start Rising+ Today'
							featured
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mt-8 text-center'>
							<p className='mb-4 text-white/60'>Ready for even more growth?</p>
							<div className='flex justify-center gap-4'>
								<Link href='/services'>
									<MarketingButton marketingLook='glass' size='sm'>
										View All Services
									</MarketingButton>
								</Link>
								<MarketingButton
									marketingLook='hero-primary'
									size='sm'
									onClick={openContactModal}
								>
									Get Started
								</MarketingButton>
							</div>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<p className='mt-12 text-center text-sm text-white/60'>
							Questions about fit?{' '}
							<a
								href='mailto:hello@barely.nyc'
								className='text-purple-300 underline hover:text-purple-300'
							>
								Email me directly
							</a>{' '}
							- no sales team, just the engineer who builds your campaigns.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Price Comparison */}
			{/* <section className='bg-white/5 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-8 text-center text-2xl md:text-3xl'>
							Compare All Services
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
							<div className='opacity-60'>
								<Link href='/services/bedroom'>
									<PricingCard
										title='Bedroom+'
										price='$200'
										description='Learn the scientific method'
										features={[
											'Bi-weekly 30-min coaching',
											'barely.ai tools (Bedroom tier)',
											'Campaign blueprints',
											'Merch platform + strategy',
											'Direct email support',
										]}
										ctaText='Learn More →'
									/>
								</Link>
							</div>

							<PricingCard
								title='Rising+'
								price='$750'
								description='Professional execution'
								features={[
									'Up to 2 campaigns/month',
									'$1-3K ad spend management',
									'barely.ai tools (Rising tier)',
									'Monthly strategy calls',
									'Revenue optimization',
								]}
								ctaText='Currently Selected'
								featured
							/>

							<div className='opacity-60'>
								<Link href='/services/breakout'>
									<PricingCard
										title='Breakout+'
										price='$1,800'
										description='Maximum growth engineering'
										features={[
											'Advanced campaign execution',
											'$3-6K ad spend management',
											'barely.ai tools (Breakout tier)',
											'Bi-weekly deep dives',
											'Priority support',
										]}
										ctaText='Learn More →'
									/>
								</Link>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section> */}
		</main>
	);
}
