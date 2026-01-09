'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { NYC_BREAKOUT_PLUS } from '@barely/const';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { PricingCard } from '../../../components/marketing/pricing-card';
import { useContactModal } from '../../../contexts/contact-modal-context';

export const metadata: Metadata = {
	title: 'Breakout+ Service - Maximum Growth Engineering | Barely NYC',
	description:
		'Brooklyn-based music marketing engineers for artists with 50K+ monthly listeners ready to scale aggressively. Full campaign execution with scientific optimization.',
};

export default function BreakoutPlusPage() {
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
									${NYC_BREAKOUT_PLUS.price.monthly.amount}
								</span>
								<span className='text-xl font-semibold text-purple-300 md:text-2xl'>
									${NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth}/month
								</span>
							</div>
						</div>
						<H
							size='1'
							className='gradient-text mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'
						>
							Breakout+
						</H>
						<p className='mb-4 text-2xl text-white md:text-3xl'>
							Maximum Growth Engineering
						</p>
						<p className='text-lg text-white/70'>
							Perfect for artists with 50K+ monthly listeners • Scale aggressively with
							full transparency
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Intro Section */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='glass mb-12 rounded-2xl border border-purple-500/30 p-8 shadow-[0_0_60px_rgba(168,85,247,0.3)]'>
							<H size='3' className='mb-6 text-2xl md:text-3xl'>
								You&apos;ve Proven Your Music Works. Now Let&apos;s Engineer Your
								Breakout.
							</H>
							<p className='mb-4 text-lg leading-relaxed text-white/80'>
								Breakout+ is built for moments that matter: your album cycle, your first
								headline tour, the year you want labels paying attention. This isn&apos;t
								maintenance-mode marketing—it&apos;s a full push with everything
								we&apos;ve got.
							</p>
							<p className='mb-4 text-lg leading-relaxed text-white/80'>
								You&apos;re ready to invest serious resources into scaling to the next
								level—and you want every dollar working efficiently with complete
								transparency into the process.
							</p>
							<p className='text-xl font-semibold text-white'>
								Breakout+ is maximum growth engineering for artists at an inflection
								point.
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
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🚀</span>
									<div>
										<H size='5' className='mb-2'>
											Up to 2 Advanced Campaigns Per Month with Full Execution
										</H>
										<p className='text-white/70'>
											Complete campaign design, technical implementation, and
											optimization. We handle everything from audience research to ad
											creative to landing page optimization. You focus on creating.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>💰</span>
									<div>
										<H size='5' className='mb-2'>
											Expert Management of Up to $6,000 Monthly Ad Spend
										</H>
										<p className='text-white/70'>
											Your $3-6K monthly budget optimized across platforms with advanced
											attribution modeling, audience segmentation, and real-time campaign
											adjustment. Maximum efficiency, zero waste.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛒</span>
									<div>
										<H size='5' className='mb-2'>
											Complete Merch Revenue Optimization
										</H>
										<p className='text-white/70'>
											Full strategy, platform management, and campaign integration. We
											engineer your entire funnel from discovery to purchase, maximizing
											both streaming and physical sales with 50-90% immediate returns.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={500}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>📅</span>
									<div>
										<H size='5' className='mb-2'>
											Content Scheduling + Timing Optimization
										</H>
										<p className='text-white/70'>
											You create the content, we handle the release calendar. We&apos;ll
											schedule posts across platforms based on your audience&apos;s
											activity patterns, coordinate content drops with ad campaigns, and
											time announcements for maximum algorithmic lift. You send us the
											assets; we make sure they land.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						{/* Stan+ Included */}
						<AnimatedSection animation='fade-up' delay={550}>
							<div className='glass rounded-xl border border-purple-500/30 bg-purple-500/10 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🎭</span>
									<div>
										<H size='5' className='mb-2 text-purple-300'>
											Stan Fan Account Included ($500 value)
										</H>
										<p className='text-white/70'>
											A dedicated Instagram fan account for your project, managed by us.
											Daily posts, memes, repurposed content, and community engagement—all
											the stuff that&apos;s too informal for your main but builds superfan
											culture.{' '}
											<Link
												href='/services/stan'
												className='text-purple-300 underline hover:text-purple-200'
											>
												Learn more about Stan →
											</Link>
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={600}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>🛠️</span>
									<div>
										<H size='5' className='mb-2'>
											Full Access to barely.ai Tools (Breakout Tier Included)
										</H>
										<p className='text-white/70'>
											Premium analytics, advanced automation, A/B testing capabilities,
											and priority technical support. Everything at the enterprise level,
											included free.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={700}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>📊</span>
									<div>
										<H size='5' className='mb-2'>
											Bi-Weekly Strategy Sessions with Advanced Analytics
										</H>
										<p className='text-white/70'>
											1-hour deep dives into performance data, audience insights, and
											growth optimization. You&apos;ll understand not just what&apos;s
											working, but how to replicate and scale it.
										</p>
									</div>
								</div>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={800}>
							<div className='glass rounded-xl border border-purple-500/20 p-6'>
								<div className='flex items-start gap-4'>
									<span className='text-3xl'>⚡</span>
									<div>
										<H size='5' className='mb-2'>
											Priority Support + Rapid Campaign Adjustments
										</H>
										<p className='text-white/70'>
											Direct access for urgent optimizations, algorithm updates, or
											time-sensitive opportunities. When you need to move fast, we&apos;re
											ready.
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
							The Process: Full Growth Engineering
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='slide-right' delay={200}>
							<div className='flex gap-4'>
								<div className='w-40 flex-shrink-0 font-bold text-purple-300'>
									Deep Analysis:
								</div>
								<p className='text-white/80'>
									Comprehensive audit of your current performance, audience data, and
									growth opportunities
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={300}>
							<div className='flex gap-4'>
								<div className='w-40 flex-shrink-0 font-bold text-purple-300'>
									Strategic Planning:
								</div>
								<p className='text-white/80'>
									Custom growth roadmap with specific milestones and optimization targets
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={400}>
							<div className='flex gap-4'>
								<div className='w-40 flex-shrink-0 font-bold text-purple-300'>
									Full Execution:
								</div>
								<p className='text-white/80'>
									Complete campaign management while you focus on content creation and fan
									engagement
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={500}>
							<div className='flex gap-4'>
								<div className='w-40 flex-shrink-0 font-bold text-purple-300'>
									Continuous Optimization:
								</div>
								<p className='text-white/80'>
									Daily monitoring and adjustment based on performance data and market
									changes
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='slide-right' delay={600}>
							<div className='flex gap-4'>
								<div className='w-40 flex-shrink-0 font-bold text-purple-300'>
									Revenue Maximization:
								</div>
								<p className='text-white/80'>
									Integrated streaming and merch strategies for both discovery and
									monetization
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* What's Different from Rising+? */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							How is this different from Rising+?
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						{[
							{
								label: 'Higher budget ceiling',
								desc: 'We manage up to $6K/month in ad spend (vs. $3K)',
							},
							{
								label: 'More touchpoints',
								desc: 'Bi-weekly strategy calls instead of monthly',
							},
							{
								label: 'Content scheduling',
								desc: 'We handle your release calendar and posting timing',
							},
							{
								label: 'Stan account included',
								desc: 'A managed fan Instagram page ($500 value)',
							},
							{
								label: 'Priority support',
								desc: 'Direct access for urgent optimizations and opportunities',
							},
							{
								label: 'Inflection-point focus',
								desc: 'Built for album cycles, tours, and label-ready moments',
							},
						].map((item, index) => (
							<AnimatedSection key={index} animation='fade-up' delay={200 + index * 100}>
								<div className='glass rounded-lg p-4'>
									<p className='font-semibold text-purple-300'>{item.label}</p>
									<p className='text-sm text-white/70'>{item.desc}</p>
								</div>
							</AnimatedSection>
						))}
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
							'Artists at an inflection point: album cycles, tours, or label-ready moments',
							'Musicians with $3-6K monthly marketing budgets who want maximum ROI',
							'Artists who want complete professional execution with full transparency',
							'Bands preparing for major releases or label negotiations',
							'Musicians ready to treat their art like a serious business',
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

			{/* What Makes Breakout+ Different */}
			{/* <section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							What Makes Breakout+ Different
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='mb-8 text-center text-lg text-white/80'>
							Unlike premium agencies that charge similar rates while keeping you in the
							dark:
						</p>
					</AnimatedSection>

					<div className='space-y-4'>
						{[
							'Complete transparency about every strategy, decision, and dollar spent',
							'Open-source platform means you can see exactly how campaigns operate',
							'Focus on both streaming growth AND revenue optimization',
							'Bi-weekly education so you understand the methodology',
							'No fake playlist placements or algorithm violations',
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

			{/* Testimonials */}
			{/* <section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Recent Breakout+ Results
						</H>
					</AnimatedSection>

					<div className='space-y-8'>
						<AnimatedSection animation='fade-up' delay={200}>
							<blockquote className='glass rounded-xl border border-purple-500/20 p-6'>
								<p className='mb-4 text-lg italic text-white/90'>
									&quot;In 6 months we went from 45K to 120K monthly listeners while
									tripling our merch revenue. [Your name] doesn&apos;t just grow streams -
									he builds sustainable music businesses.&quot;
								</p>
								<cite className='text-white/70'>- [Client Band], Alt Rock</cite>
							</blockquote>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<blockquote className='glass rounded-xl border border-purple-500/20 p-6'>
								<p className='mb-4 text-lg italic text-white/90'>
									&quot;Finally, an agency that shows me exactly where every dollar goes
									and why. Our cost per fan acquisition dropped 60% while our lifetime
									value doubled.&quot;
								</p>
								<cite className='text-white/70'>- [Client Name], Indie Rock</cite>
							</blockquote>
						</AnimatedSection>
					</div>
				</div>
			</section> */}

			{/* Price Anchor */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-2xl text-center'>
					<AnimatedSection animation='fade-up'>
						<p className='text-lg text-white/80'>
							<span className='font-semibold text-white'>For context:</span> A part-time
							marketing hire would cost $3-4K/month minimum, and they wouldn&apos;t bring
							this toolkit or methodology. Breakout+ gives you a full growth team at a
							fraction of the cost.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Pricing CTA */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-md'>
					<AnimatedSection animation='scale'>
						<div className='relative'>
							<div className='animate-glow-pulse absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 opacity-75 blur-lg' />
							<PricingCard
								title={NYC_BREAKOUT_PLUS.name}
								price={`$${NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth}`}
								originalPrice={`$${NYC_BREAKOUT_PLUS.price.monthly.amount}`}
								description={NYC_BREAKOUT_PLUS.marketingDescription ?? ''}
								features={[
									'Up to 2 advanced campaigns with full execution',
									'Management of $3-6K monthly ad spend',
									'Complete merch revenue optimization',
									'Stan fan account included ($500 value)',
									'Bi-weekly strategy sessions with analytics',
									'Content scheduling + timing optimization',
									'Priority support + rapid adjustments',
								]}
								ctaText='Start Breakout+ Today'
								className='relative'
								onCTAClick={openContactModal}
							/>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='mt-8 text-center'>
							<p className='mb-4 text-white/60'>Compare our services:</p>
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
							Ready to discuss your specific growth goals?{' '}
							<a
								href='mailto:hello@barely.nyc'
								className='text-purple-300 underline hover:text-purple-300'
							>
								Email me directly
							</a>{' '}
							- no sales team, just the engineer who&apos;ll build your campaigns.
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

							<div className='opacity-60'>
								<Link href='/services/rising'>
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
										ctaText='Learn More →'
									/>
								</Link>
							</div>

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
								ctaText='Currently Selected'
								featured
							/>
						</div>
					</AnimatedSection>
				</div>
			</section> */}
		</main>
	);
}
