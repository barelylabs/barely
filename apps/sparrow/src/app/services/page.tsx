import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/AnimatedSection';
import { PricingCard } from '../../components/marketing/PricingCard';

export const metadata: Metadata = {
	title: 'Services - Music Marketing That Makes Sense | Barely Sparrow',
	description:
		'Choose the service that fits your needs and budget. From DIY coaching to full campaign execution, all with complete transparency.',
};

export default function ServicesPage() {
	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Choose Your Growth Path
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							From DIY coaching to full campaign execution, all with complete transparency
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						<AnimatedSection animation='fade-up' delay={0}>
							<Link href='/services/bedroom'>
								<PricingCard
									title='Bedroom+'
									price='$100'
									originalPrice='$200'
									description='Learn the scientific method'
									features={[
										'Bi-weekly 30-min coaching',
										'barely.io tools (Bedroom tier)',
										'Campaign blueprints',
										'Merch platform + strategy',
										'Direct email support',
									]}
									ctaText='Learn More →'
									spotsLeft={5}
								/>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={200}>
							<Link href='/services/rising'>
								<PricingCard
									title='Rising+'
									price='$500'
									originalPrice='$750'
									description='Professional execution'
									features={[
										'Up to 2 campaigns/month',
										'$1-3K ad spend management',
										'barely.io tools (Rising tier)',
										'Monthly strategy calls',
										'Revenue optimization',
									]}
									ctaText='Learn More →'
									featured
									spotsLeft={3}
								/>
							</Link>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<Link href='/services/breakout'>
								<PricingCard
									title='Breakout+'
									price='$1,300'
									originalPrice='$1,800'
									description='Maximum growth engineering'
									features={[
										'Advanced campaign execution',
										'$3-6K ad spend management',
										'barely.io tools (Breakout tier)',
										'Bi-weekly deep dives',
										'Priority support',
									]}
									ctaText='Learn More →'
									spotsLeft={2}
								/>
							</Link>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Comparison Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Which Service is Right for You?
						</H>
					</AnimatedSection>

					<div className='space-y-8'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<H size='4' className='gradient-text mb-4'>
									Choose Bedroom+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>• You have 0-10K monthly listeners</li>
									<li>• You want to learn marketing skills yourself</li>
									<li>
										• You prefer understanding the &quot;why&quot; behind strategies
									</li>
									<li>• Your budget is limited but you have time to invest</li>
								</ul>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<H size='4' className='gradient-text mb-4'>
									Choose Rising+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>• You have 10-50K monthly listeners (or budget to jumpstart)</li>
									<li>• You want professional campaign execution</li>
									<li>• You have $1-3K monthly to invest in ads</li>
									<li>• You&apos;d rather focus on creating than marketing</li>
								</ul>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<H size='4' className='gradient-text mb-4'>
									Choose Breakout+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>• You have 50K+ monthly listeners</li>
									<li>• You&apos;re ready for aggressive scaling</li>
									<li>• You have $3-6K monthly marketing budget</li>
									<li>• You want maximum growth with full transparency</li>
								</ul>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Common Questions
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<H size='5' className='mb-3'>
									Can I switch between service tiers?
								</H>
								<p className='text-white/70'>
									Absolutely. Many artists start with Bedroom+ to learn the fundamentals,
									then upgrade to Rising+ or Breakout+ as they grow. You can change tiers
									at any time.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6'>
								<H size='5' className='mb-3'>
									What makes you different from other agencies?
								</H>
								<p className='text-white/70'>
									Complete transparency. I built the tools from scratch (open-source),
									show you exactly how campaigns work, and report on everything. No black
									boxes, no fake guarantees, just data-driven strategies that actually
									work.
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6'>
								<H size='5' className='mb-3'>
									Do you guarantee streaming numbers?
								</H>
								<p className='text-white/70'>
									No, and run from anyone who does. What I guarantee is transparent
									reporting, data-driven strategies, and campaigns that follow platform
									guidelines. Real growth takes time and the right approach.
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>
		</main>
	);
}
