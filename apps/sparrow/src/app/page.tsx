import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../components/marketing/AnimatedSection';
import { ArtistTestimonials } from '../components/marketing/ArtistTestimonials';
import { MarketingButton } from '../components/marketing/Button';
import { EnhancedSuccessTicker } from '../components/marketing/EnhancedSuccessTicker';
import { FounderStoryTeaser } from '../components/marketing/FounderStoryTeaser';
import { Hero } from '../components/marketing/Hero';
import { ChartIcon, FlaskIcon, MusicIcon } from '../components/marketing/Icons';
import { ProblemSolutionSection } from '../components/marketing/ProblemSolutionSection';
import { ResultsDashboard } from '../components/marketing/ResultsDashboard';
import { ValueCard } from '../components/marketing/ValueCard';

export default function HomePage() {
	return (
		<main className='pt-16'>
			{' '}
			{/* Offset for fixed navigation */}
			{/* Hero Section */}
			<Hero />
			{/* Success Ticker */}
			<section className='px-4 py-8 sm:px-6 lg:px-8'>
				<div className='mx-auto flex max-w-7xl justify-center'>
					<AnimatedSection animation='fade-up'>
						<EnhancedSuccessTicker />
					</AnimatedSection>
				</div>
			</section>
			{/* Three-Column Value Props */}
			<section className='relative px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={0}>
							<ValueCard
								icon={<FlaskIcon className='h-8 w-8' />}
								title='Your Music Deserves Better'
								description="While others rent software, I built barely.io from scratch. It's open-source, which means you can see exactly how everything works. No black boxes."
							/>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={200}>
							<ValueCard
								icon={<ChartIcon className='h-8 w-8' />}
								title='Proven Strategies That Work'
								description="Every strategy is proven with real data - including on my own band. You'll see exactly what's working and why, with full reporting on every campaign."
							/>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<ValueCard
								icon={<MusicIcon className='h-8 w-8' />}
								title='You Create, We Optimize'
								description='You handle the creative - making music, connecting with fans, building your brand. We handle the algorithms, attribution modeling, and technical optimization. Focus on what you love.'
							/>
						</AnimatedSection>
					</div>
				</div>
			</section>
			{/* Problem/Solution Section */}
			<ProblemSolutionSection />
			{/* Services Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-7xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-4 text-center text-4xl md:text-5xl'>
							Choose Your Growth Path
						</H>
						<p className='mx-auto mb-12 max-w-3xl text-center text-xl text-white/70'>
							From DIY coaching to full campaign execution, all with complete transparency
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
											<span className='text-xs text-purple-300'>First month only</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>$200</span>
												<span className='text-lg font-semibold text-purple-300'>
													$100/month
												</span>
											</div>
										</div>
										<H size='3' className='mb-4 text-2xl'>
											Bedroom+
										</H>
										<p className='mb-6 text-white/70'>
											Learn the scientific method for music marketing with bi-weekly
											coaching.
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
										<div className='absolute -top-3 right-4'>
											<span className='rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-500'>
												3 spots left
											</span>
										</div>
										<div className='mb-2 space-y-1'>
											<span className='text-xs text-purple-300'>First month only</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>$750</span>
												<span className='text-lg font-semibold text-purple-300'>
													$500/month
												</span>
											</div>
										</div>
										<H size='3' className='mb-4 text-2xl'>
											Rising+
										</H>
										<p className='mb-6 text-white/70'>
											Professional campaign execution with full transparency and
											reporting.
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
											<span className='text-xs text-purple-300'>First month only</span>
											<div className='flex items-baseline gap-2'>
												<span className='text-sm text-white/40 line-through'>$1,800</span>
												<span className='text-lg font-semibold text-purple-300'>
													$1,300/month
												</span>
											</div>
										</div>
										<H size='3' className='mb-4 text-2xl'>
											Breakout+
										</H>
										<p className='mb-6 text-white/70'>
											Maximum growth engineering for artists ready to scale aggressively.
										</p>
										<p className='text-purple-300 transition-colors group-hover:text-purple-300'>
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>
					</div>

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
			<FounderStoryTeaser />
			{/* Results Dashboard Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-5xl'>
					<AnimatedSection animation='fade-up'>
						<ResultsDashboard />
					</AnimatedSection>
				</div>
			</section>
			{/* CTA Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-8 text-4xl md:text-5xl'>
							Ready to Try a Scientific Approach to Music Marketing?
						</H>
						<p className='mb-12 text-xl text-white/70'>
							Choose the service that fits your needs and budget.
						</p>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<Link href='/services/bedroom'>
								<MarketingButton
									marketingLook='hero-primary'
									size='lg'
									className='min-w-[200px]'
								>
									See Our Services
								</MarketingButton>
							</Link>
							<a href='https://barely.io' target='_blank' rel='noopener noreferrer'>
								<MarketingButton
									marketingLook='scientific'
									size='lg'
									className='min-w-[200px]'
								>
									Try barely.io Tools
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
