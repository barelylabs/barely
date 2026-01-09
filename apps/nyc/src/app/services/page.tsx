'use client';

import Link from 'next/link';
import { NYC_STAN, NYC_STAN_PLUS, WORKSPACE_PLANS } from '@barely/const';
import { getAbsoluteUrl } from '@barely/utils';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { MarketingButton } from '../../components/marketing/button';
import { PricingCard } from '../../components/marketing/pricing-card';
import { useContactModal } from '../../contexts/contact-modal-context';

// export const metadata: Metadata = {
// 	title: 'Services - Music Marketing Engineers | Barely NYC',
// 	description:
// 		'Brooklyn-based music marketing engineers. Choose the service that fits your needs. From coaching to full campaign execution, all with data-driven transparency.',
// };

export default function ServicesPage() {
	const { open: openContactModal } = useContactModal();
	// Get plus plans from constants
	const bedroomPlusPlan = WORKSPACE_PLANS.get('bedroom.plus');
	const risingPlusPlan = WORKSPACE_PLANS.get('rising.plus');
	const breakoutPlusPlan = WORKSPACE_PLANS.get('breakout.plus');

	// Type for plans from constants
	type PlanFromMap = NonNullable<ReturnType<typeof WORKSPACE_PLANS.get>>;

	// Helper to get monthly price
	const getMonthlyPrice = (plan: PlanFromMap) => plan.price.monthly.amount;

	// Helper to get first month promotional price
	const getFirstMonthPrice = (plan: PlanFromMap) =>
		plan.promotionalPrice?.firstMonth ?? plan.price.monthly.amount;

	// Helper to extract key features
	const getBedroomPlusFeatures = () => [
		'Bi-weekly 30-minute coaching calls',
		'Full access to barely.ai tools (Bedroom tier)',
		'Integrated merch platform + strategy coaching',
		'Direct email support',
	];

	const getRisingPlusFeatures = () => [
		'Up to 2 professional campaigns per month',
		'Management of $1,000-$3,000 monthly ad spend',
		'Merch campaign strategy + revenue optimization',
		'Monthly strategy calls',
		'Full access to barely.ai tools (Rising tier)',
	];

	const getBreakoutPlusFeatures = () => [
		'Up to 2 advanced campaigns per month',
		'Management of $3,000-$6,000 monthly ad spend',
		'Full merch revenue optimization',
		'Stan fan account included ($500 value)',
		'Bi-weekly strategy calls + priority support',
	];

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Choose Your Growth Path
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Brooklyn-based music marketing engineers helping indie artists build real
							revenue—not just streams. From coaching to full campaign execution, all
							with scientific precision.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-6xl'>
					<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
						{bedroomPlusPlan && (
							<AnimatedSection animation='fade-up' delay={0}>
								<PricingCard
									title={bedroomPlusPlan.name}
									price={`$${getFirstMonthPrice(bedroomPlusPlan)}`}
									originalPrice={`$${getMonthlyPrice(bedroomPlusPlan)}`}
									description={bedroomPlusPlan.marketingTagline ?? ''}
									features={getBedroomPlusFeatures()}
									ctaText='Get Started'
									spotsLeft={5}
									onCTAClick={openContactModal}
									learnMoreHref='/services/bedroom'
								/>
							</AnimatedSection>
						)}

						{risingPlusPlan && (
							<AnimatedSection animation='fade-up' delay={200}>
								<PricingCard
									title={risingPlusPlan.name}
									price={`$${getFirstMonthPrice(risingPlusPlan)}`}
									originalPrice={`$${getMonthlyPrice(risingPlusPlan)}`}
									description={risingPlusPlan.marketingTagline ?? ''}
									features={getRisingPlusFeatures()}
									ctaText='Get Started'
									featured
									spotsLeft={3}
									onCTAClick={openContactModal}
									learnMoreHref='/services/rising'
								/>
							</AnimatedSection>
						)}

						{breakoutPlusPlan && (
							<AnimatedSection animation='fade-up' delay={400}>
								<PricingCard
									title={breakoutPlusPlan.name}
									price={`$${getFirstMonthPrice(breakoutPlusPlan)}`}
									originalPrice={`$${getMonthlyPrice(breakoutPlusPlan)}`}
									description={breakoutPlusPlan.marketingTagline ?? ''}
									features={getBreakoutPlusFeatures()}
									ctaText='Get Started'
									spotsLeft={2}
									onCTAClick={openContactModal}
									learnMoreHref='/services/breakout'
								/>
							</AnimatedSection>
						)}
					</div>

					<AnimatedSection animation='fade-up' delay={500}>
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
				</div>
			</section>

			{/* Comparison Section */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-3xl md:text-4xl'>
							Which Service is Right for You?
						</H>
					</AnimatedSection>

					<div className='space-y-8'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6 transition-all hover:border-purple-500/30'>
								<H size='4' className='gradient-text mb-4'>
									Choose Bedroom+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>• You have time to invest in learning marketing yourself</li>
									<li>
										• Your ad budget is limited (under $1K/month) but you&apos;re ready
										to put in the work
									</li>
									<li>
										• You want to understand the &quot;why&quot; behind every strategy
									</li>
									<li>
										• Typically 0-10K monthly listeners, but mindset matters more than
										numbers
									</li>
								</ul>
								<button
									onClick={openContactModal}
									className='mt-4 hidden text-sm text-purple-300 underline-offset-4 transition-all hover:text-purple-200 hover:underline sm:block'
								>
									Get Started with Bedroom+ →
								</button>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl p-6 transition-all hover:border-purple-500/30'>
								<H size='4' className='gradient-text mb-4'>
									Choose Rising+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>
										• You have $1-3K monthly to invest in ads and want professional
										execution
									</li>
									<li>
										• You&apos;d rather focus on creating music than managing campaigns
									</li>
									<li>
										• You want transparent reporting on exactly what&apos;s working
									</li>
									<li>
										• Any listener count—budget and commitment matter more than current
										size
									</li>
								</ul>
								<button
									onClick={openContactModal}
									className='mt-4 hidden text-sm text-purple-300 underline-offset-4 transition-all hover:text-purple-200 hover:underline sm:block'
								>
									Get Started with Rising+ →
								</button>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={400}>
							<div className='glass rounded-xl p-6 transition-all hover:border-purple-500/30'>
								<H size='4' className='gradient-text mb-4'>
									Choose Breakout+ if:
								</H>
								<ul className='space-y-2 text-white/80'>
									<li>
										• You have $3-6K monthly to invest in marketing and want maximum ROI
									</li>
									<li>
										• You&apos;re at an inflection point: album cycle, tour, or building
										toward label conversations
									</li>
									<li>• You want a full growth team, not just campaign management</li>
									<li>• Now includes a Stan fan account to amplify your reach</li>
								</ul>
								<button
									onClick={openContactModal}
									className='mt-4 hidden text-sm text-purple-300 underline-offset-4 transition-all hover:text-purple-200 hover:underline sm:block'
								>
									Get Started with Breakout+ →
								</button>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Stan Add-on Section */}
			<section className='px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-6 text-center text-3xl md:text-4xl'>
							Amplify Your Reach with Stan
						</H>
						<p className='mb-12 text-center text-lg text-white/70'>
							Fan accounts have become a secret weapon for artist growth—a second
							Instagram presence that&apos;s free from the &quot;brand&quot; constraints
							of your main channel. Memes, chopped-up video clips, fan content reposts,
							and the chaotic energy that builds superfan communities.
						</p>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
						<AnimatedSection animation='fade-up' delay={200}>
							<div className='glass rounded-xl p-6'>
								<div className='mb-4 flex items-center justify-between'>
									<H size='4' className='text-purple-300'>
										{NYC_STAN.name}
									</H>
									<div className='text-right'>
										<span className='block text-sm text-white/50 line-through'>
											${NYC_STAN.price.addon}/mo add-on
										</span>
										<span className='text-lg font-semibold text-purple-300'>
											${NYC_STAN.promotionalPrice.addon}/mo first month
										</span>
									</div>
								</div>
								<p className='mb-4 text-sm text-white/60'>
									Or ${NYC_STAN.price.standalone}/mo standalone
								</p>
								<p className='mb-4 text-white/80'>
									Daily Instagram posts mixing repurposed content, AI-generated visuals,
									and meme-format engagement. You provide the raw material; we keep the
									account active and growing.
								</p>
								<ul className='space-y-2'>
									{NYC_STAN.features.map((feature, i) => (
										<li key={i} className='flex items-start gap-2 text-sm text-white/70'>
											<span className='mt-0.5 text-green-500'>✓</span>
											{feature}
										</li>
									))}
								</ul>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<div className='glass rounded-xl border border-purple-500/30 p-6'>
								<div className='mb-4 flex items-center justify-between'>
									<H size='4' className='text-purple-300'>
										{NYC_STAN_PLUS.name}
									</H>
									<div className='text-right'>
										<span className='block text-sm text-white/50 line-through'>
											${NYC_STAN_PLUS.price.addon}/mo add-on
										</span>
										<span className='text-lg font-semibold text-purple-300'>
											${NYC_STAN_PLUS.promotionalPrice.addon}/mo first month
										</span>
									</div>
								</div>
								<p className='mb-4 text-sm text-white/60'>
									Or ${NYC_STAN_PLUS.price.standalone}/mo standalone •{' '}
									<span className='text-purple-300'>Included with Breakout+</span>
								</p>
								<p className='mb-4 text-white/80'>
									Everything in Stan, plus active community management: responding to
									comments, reposting fan stories, seeding interactions on your main
									account, and building real fan culture.
								</p>
								<ul className='space-y-2'>
									{NYC_STAN_PLUS.features.map((feature, i) => (
										<li key={i} className='flex items-start gap-2 text-sm text-white/70'>
											<span className='mt-0.5 text-green-500'>✓</span>
											{feature}
										</li>
									))}
								</ul>
							</div>
						</AnimatedSection>
					</div>

					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mt-8 text-center'>
							<Link href='/services/stan'>
								<MarketingButton marketingLook='glass' size='sm'>
									Learn more about Stan →
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
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
									What makes Barely different from other agencies?
								</H>
								<p className='text-white/70'>
									We're music marketing engineers. We built the tools from scratch
									(open-source), show you exactly how campaigns work, and report on
									everything. No black boxes, no fake guarantees, just scientific methods
									applied to artist growth.
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
