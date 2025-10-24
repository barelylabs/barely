'use client';

import Link from 'next/link';
import { NYC_BEDROOM_PLUS, NYC_BREAKOUT_PLUS, NYC_RISING_PLUS } from '@barely/const';
import { getAbsoluteUrl } from '@barely/utils';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../components/marketing/animated-section';
import { ArtistTestimonials } from '../components/marketing/artist-testimonials';
import { MarketingButton } from '../components/marketing/button';
// import { EnhancedSuccessTicker } from '../components/marketing/enhanced-success-ticker';
// import { FounderStoryTeaser } from '../components/marketing/founder-story-teaser';
import { Hero } from '../components/marketing/hero';
import { ChartIcon, MusicIcon, ZapIcon } from '../components/marketing/icons';
import { ProblemSolutionSection } from '../components/marketing/problem-solution-section';
// import { ResultsDashboard } from '../components/marketing/results-dashboard';
import { ValueCard } from '../components/marketing/value-card';
import { useContactModal } from '../contexts/contact-modal-context';

export default function HomePage() {
	const { open: openContactModal } = useContactModal();
	return (
		<main className='pt-16'>
			{' '}
			{/* Offset for fixed navigation */}
			{/* Hero Section */}
			<Hero />
			{/* Success Ticker */}
			{/* <section className='px-4 py-8 sm:px-6 lg:px-8'>
				<div className='mx-auto flex max-w-7xl justify-center'>
					<AnimatedSection animation='fade-up'>
						<EnhancedSuccessTicker />
					</AnimatedSection>
				</div>
			</section> */}
			{/* Three-Column Value Props */}
			<section className='relative px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={0}>
							<ValueCard
								icon={<ZapIcon className='h-8 w-8' />}
								title='Engineering, Not Magic'
								description="Most agencies chase vanity metrics with cheap tricks. Empty calories that don't build real fans. We show our work: open-source platform, real attribution, every campaign explained. Marketing engineers building sustainable growth, not quick fixes."
							/>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={200}>
							<ValueCard
								icon={<ChartIcon className='h-8 w-8' />}
								title='Honest Timelines'
								description='Year 1 is an investment (expect losses while building your fanbase). Year 2 is where profitability happens. Year 3+ is sustainable independence. No fake promises or overnight success stories. Just transparent methods that compound over time.'
							/>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<ValueCard
								icon={<MusicIcon className='h-8 w-8' />}
								title='You Own Everything'
								description="You own every asset we help you grow—playlists, merch campaigns, fan relationships. They're yours forever, whether you work with us or not. No lock-in. No dependencies. Just sustainable growth you control. That's how we're building the indie middle class."
							/>
						</AnimatedSection>
					</div>
				</div>
			</section>
			{/* Problem/Solution Section */}
			<ProblemSolutionSection />
			{/* Indie Middle Class Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-6 text-4xl md:text-5xl'>
							Building the Indie Middle Class
						</H>
						<p className='mb-12 text-xl text-white/70'>
							The music industry has superstars and struggling artists—not much in
							between. We&apos;re changing that.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass mx-auto max-w-3xl rounded-2xl p-8 md:p-12'>
							<p className='mb-8 text-lg text-white/90'>
								<strong>Our 2026 goal:</strong> Help our clients generate{' '}
								<span className='text-purple-300'>$1M in combined sales revenue</span> and{' '}
								<span className='text-purple-300'>20M streams</span>.
							</p>
							<p className='mb-8 text-lg text-white/80'>
								That&apos;s roughly 20 indie artists making{' '}
								<strong>$50k/year from their music by Year 2.</strong>
							</p>
							<p className='text-white/70'>
								Not overnight success. Not fake guarantees. Just transparent methods that
								compound over time.
							</p>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mt-12'>
							<Link href='/about'>
								<MarketingButton marketingLook='glass' size='lg'>
									See How It Works →
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
				</div>
			</section>
			{/* Services Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-4 text-center text-4xl md:text-5xl'>
							Choose Your Growth Path
						</H>
						<p className='mx-auto mb-12 max-w-3xl text-center text-xl text-white/70'>
							From coaching to full campaign execution, all with complete transparency
						</p>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={200}>
							<Link href='/services/bedroom'>
								<div className='group h-full'>
									<div className='glass glow-card-purple relative h-full rounded-2xl border border-white/10 p-8 transition-all duration-150 group-hover:scale-105 group-hover:border-purple-500/50'>
										<div className='absolute -top-3 right-4'>
											<span className='rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-500'>
												5 spots left
											</span>
										</div>
										<div className='mb-2 space-y-1'>
											<span className='text-xs text-purple-300'>
												{NYC_BEDROOM_PLUS.promotionalPrice?.description}
											</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>
													${NYC_BEDROOM_PLUS.price.monthly.amount}
												</span>
												<span className='text-lg font-semibold text-purple-300'>
													${NYC_BEDROOM_PLUS.promotionalPrice?.firstMonth}/month
												</span>
											</div>
										</div>
										<H size='4' className='mb-4 text-4xl lg:text-5xl'>
											{NYC_BEDROOM_PLUS.name}
										</H>
										<p className='mb-6 text-white/70'>
											Learn marketing engineering through bi-weekly coaching. Build skills
											that compound forever.
										</p>
										<p className='text-purple-300 transition-colors group-hover:text-purple-300'>
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<Link href='/services/rising'>
								<div className='group h-full'>
									<div className='glass glow-card-purple-featured relative h-full rounded-2xl border border-purple-500/30 p-8 transition-all duration-150 group-hover:scale-105 group-hover:border-purple-500/50'>
										<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
											<span className='rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-xs font-semibold text-white'>
												Most Popular
											</span>
										</div>
										<div className='absolute -bottom-3 left-1/2 -translate-x-1/2'>
											<span className='rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-500'>
												3 spots left
											</span>
										</div>
										<div className='mb-2 space-y-1'>
											<span className='text-xs text-purple-300'>
												{NYC_RISING_PLUS.promotionalPrice?.description}
											</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>
													${NYC_RISING_PLUS.price.monthly.amount}
												</span>
												<span className='text-lg font-semibold text-purple-300'>
													${NYC_RISING_PLUS.promotionalPrice?.firstMonth}/month
												</span>
											</div>
										</div>
										<H size='4' className='mb-4 text-4xl lg:text-5xl'>
											{NYC_RISING_PLUS.name}
										</H>
										<p className='mb-6 text-white/70'>
											We execute your campaigns with complete transparency. You see every
											strategy, every dollar, every result.
										</p>
										<p className='text-purple-300 transition-colors group-hover:text-purple-300'>
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<Link href='/services/breakout'>
								<div className='group h-full'>
									<div className='glass glow-card-purple relative h-full rounded-2xl border border-white/10 p-8 transition-all duration-150 group-hover:scale-105 group-hover:border-purple-500/50'>
										<div className='absolute -top-3 right-4'>
											<span className='rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-500'>
												2 spots left
											</span>
										</div>
										<div className='mb-2 space-y-1'>
											<span className='text-xs text-purple-300'>
												{NYC_BREAKOUT_PLUS.promotionalPrice?.description}
											</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>
													${NYC_BREAKOUT_PLUS.price.monthly.amount}
												</span>
												<span className='text-lg font-semibold text-purple-300'>
													${NYC_BREAKOUT_PLUS.promotionalPrice?.firstMonth}/month
												</span>
											</div>
										</div>
										<H size='4' className='mb-4 text-4xl lg:text-5xl'>
											{NYC_BREAKOUT_PLUS.name}
										</H>
										<p className='mb-6 text-white/70'>
											Maximum growth with full campaign management. Bi-weekly strategy
											sessions, priority support, aggressive scaling.
										</p>
										<p className='text-purple-300 transition-colors group-hover:text-purple-300'>
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>
					</div>

					<AnimatedSection animation='fade-up' delay={400}>
						<p className='mt-8 text-center text-sm italic text-white/60'>
							*All plans get free access to the corresponding tier on{' '}
							<a
								href={getAbsoluteUrl('www')}
								target='_blank'
								rel='noopener noreferrer'
								className='text-purple-300 underline hover:text-purple-400'
							>
								barely.ai
							</a>
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={500}>
						<div className='mt-12 text-center'>
							<Link href='/services'>
								<MarketingButton marketingLook='glass' size='lg'>
									Compare All Services
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
				</div>
			</section>
			{/* Artist Testimonials */}
			<ArtistTestimonials />
			{/* Founder Story Teaser */}
			{/* <FounderStoryTeaser /> */}
			{/* Results Dashboard Section */}
			{/* <section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-5xl'>
					<AnimatedSection animation='fade-up'>
						<ResultsDashboard />
					</AnimatedSection>
				</div>
			</section> */}
			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-8 text-4xl md:text-5xl'>
							Ready to Science the Hell Out of Your Music Marketing?
						</H>
						<p className='mb-12 text-xl text-white/70'>
							Choose the service that fits your needs.
						</p>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<Link href='/services'>
								<MarketingButton
									marketingLook='hero-primary'
									size='lg'
									className='min-w-[200px]'
								>
									See Our Services
								</MarketingButton>
							</Link>
							<MarketingButton
								marketingLook='scientific'
								size='lg'
								className='min-w-[200px]'
								onClick={openContactModal}
							>
								Get Started
							</MarketingButton>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
