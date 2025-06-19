import Link from 'next/link';
import { H } from '@barely/ui/elements/typography';

import { AnimatedSection } from '../components/marketing/AnimatedSection';
import { ArtistTestimonials } from '../components/marketing/ArtistTestimonials';
import { FounderStoryTeaser } from '../components/marketing/FounderStoryTeaser';
import { Hero } from '../components/marketing/Hero';
import { ChartIcon, FlaskIcon, MusicIcon } from '../components/marketing/Icons';
import { MarketingButton } from '../components/marketing/Button';
import { ProblemSolutionSection } from '../components/marketing/ProblemSolutionSection';
import { ValueCard } from '../components/marketing/ValueCard';
import { EnhancedSuccessTicker } from '../components/marketing/EnhancedSuccessTicker';
import { ResultsDashboard } from '../components/marketing/ResultsDashboard';

export default function HomePage() {
	return (
		<main className="pt-16"> {/* Offset for fixed navigation */}
			{/* Hero Section */}
			<Hero />

			{/* Success Ticker */}
			<section className="py-8 px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl flex justify-center">
					<AnimatedSection animation="fade-up">
						<EnhancedSuccessTicker />
					</AnimatedSection>
				</div>
			</section>

			{/* Three-Column Value Props */}
			<section className="py-24 px-4 sm:px-6 lg:px-8 relative">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<AnimatedSection animation="fade-up" delay={0}>
							<ValueCard
								icon={<FlaskIcon className="w-8 h-8" />}
								title="Your Music Deserves Better"
								description="While others rent software, I built barely.io from scratch. It's open-source, which means you can see exactly how everything works. No black boxes."
							/>
						</AnimatedSection>

						<AnimatedSection animation="fade-up" delay={200}>
							<ValueCard
								icon={<ChartIcon className="w-8 h-8" />}
								title="Proven Strategies That Work"
								description="Every strategy is proven with real data - including on my own band. You'll see exactly what's working and why, with full reporting on every campaign."
							/>
						</AnimatedSection>

						<AnimatedSection animation="fade-up" delay={400}>
							<ValueCard
								icon={<MusicIcon className="w-8 h-8" />}
								title="You Create, We Optimize"
								description="You handle the creative - making music, connecting with fans, building your brand. We handle the algorithms, attribution modeling, and technical optimization. Focus on what you love."
							/>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Problem/Solution Section */}
			<ProblemSolutionSection />

			{/* Services Section */}
			<section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
				<div className="mx-auto max-w-7xl">
					<AnimatedSection animation="fade-up">
						<H size="2" className="text-center mb-4 text-4xl md:text-5xl">
							Choose Your Growth Path
						</H>
						<p className="text-center text-xl text-white/70 mb-12 max-w-3xl mx-auto">
							From DIY coaching to full campaign execution, all with complete transparency
						</p>
					</AnimatedSection>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<AnimatedSection animation="fade-up" delay={200}>
							<Link href="/services/bedroom">
								<div className="group h-full">
									<div className="glass glow-card-purple rounded-2xl p-8 h-full border border-white/10 group-hover:border-purple-500/50 transition-all duration-150 group-hover:scale-105 relative">
										<div className="absolute -top-3 right-4">
											<span className="text-xs font-medium px-3 py-1 rounded-full bg-green-500/20 text-green-500">
												5 spots left
											</span>
										</div>
										<div className="space-y-1 mb-2">
											<span className="text-xs text-purple-300">First month only</span>
											<div className="flex items-baseline gap-2">
												<span className="text-white/40 line-through text-sm">$200</span>
												<span className="text-purple-300 text-lg font-semibold">$100/month</span>
											</div>
										</div>
										<H size="3" className="mb-4 text-2xl">Bedroom+</H>
										<p className="text-white/70 mb-6">Learn the scientific method for music marketing with bi-weekly coaching.</p>
										<p className="text-purple-300 group-hover:text-purple-300 transition-colors">
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation="fade-up" delay={300}>
							<Link href="/services/rising">
								<div className="group h-full">
									<div className="glass glow-card-purple-featured rounded-2xl p-8 h-full border border-purple-500/30 group-hover:border-purple-500/50 transition-all duration-150 group-hover:scale-105 relative">
										<div className="absolute -top-3 left-1/2 -translate-x-1/2">
											<span className="bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
												Most Popular
											</span>
										</div>
										<div className="absolute -top-3 right-4">
											<span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
												3 spots left
											</span>
										</div>
										<div className="space-y-1 mb-2">
											<span className="text-xs text-purple-300">First month only</span>
											<div className="flex items-baseline gap-2">
												<span className="text-white/40 line-through text-sm">$750</span>
												<span className="text-purple-300 text-lg font-semibold">$500/month</span>
											</div>
										</div>
										<H size="3" className="mb-4 text-2xl">Rising+</H>
										<p className="text-white/70 mb-6">Professional campaign execution with full transparency and reporting.</p>
										<p className="text-purple-300 group-hover:text-purple-300 transition-colors">
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation="fade-up" delay={400}>
							<Link href="/services/breakout">
								<div className="group h-full">
									<div className="glass glow-card-purple rounded-2xl p-8 h-full border border-white/10 group-hover:border-purple-500/50 transition-all duration-150 group-hover:scale-105 relative">
										<div className="absolute -top-3 right-4">
											<span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
												2 spots left
											</span>
										</div>
										<div className="space-y-1 mb-2">
											<span className="text-xs text-purple-300">First month only</span>
											<div className="flex items-baseline gap-2">
												<span className="text-white/40 line-through text-sm">$1,800</span>
												<span className="text-purple-300 text-lg font-semibold">$1,300/month</span>
											</div>
										</div>
										<H size="3" className="mb-4 text-2xl">Breakout+</H>
										<p className="text-white/70 mb-6">Maximum growth engineering for artists ready to scale aggressively.</p>
										<p className="text-purple-300 group-hover:text-purple-300 transition-colors">
											Learn more →
										</p>
									</div>
								</div>
							</Link>
						</AnimatedSection>
					</div>

					<AnimatedSection animation="fade-up" delay={500}>
						<div className="text-center mt-12">
							<Link href="/services">
								<MarketingButton marketingLook="glass" size="lg">
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
			<section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
				<div className="mx-auto max-w-5xl">
					<AnimatedSection animation="fade-up">
						<ResultsDashboard />
					</AnimatedSection>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<AnimatedSection animation="scale">
						<H size="2" className="mb-8 text-4xl md:text-5xl">
							Ready to Try a Scientific Approach to Music Marketing?
						</H>
						<p className="text-xl text-white/70 mb-12">
							Choose the service that fits your needs and budget.
						</p>
						<div className="flex flex-col sm:flex-row gap-6 justify-center">
							<Link href="/services/bedroom">
								<MarketingButton
									marketingLook="hero-primary"
									size="lg"
									className="min-w-[200px]"
								>
									See Our Services
								</MarketingButton>
							</Link>
							<a href="https://barely.io" target="_blank" rel="noopener noreferrer">
								<MarketingButton
									marketingLook="scientific"
									size="lg"
									className="min-w-[200px]"
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