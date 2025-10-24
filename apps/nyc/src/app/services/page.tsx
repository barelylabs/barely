'use client';

import { WORKSPACE_PLANS } from '@barely/const';
import { getAbsoluteUrl } from '@barely/utils';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
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
		'Up to 2 new professional campaigns per month',
		'Management of $1,000-$3,000 monthly ad spend',
		'Monthly strategy calls',
		'Full access to barely.ai tools (Rising tier)',
		'Campaign optimization based on real-time data',
	];

	const getBreakoutPlusFeatures = () => [
		'Up to 2 new advanced campaigns per month',
		'Management of $3,000-$6,000 monthly ad spend',
		'Bi-weekly strategy calls',
		'Full access to barely.ai tools (Breakout tier)',
		'Campaign optimization based on real-time data',
	];

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
							Brooklyn-based music marketing engineers helping indie artists worldwide.
							From coaching to full campaign execution, all with scientific precision.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
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
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
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
									<li>• You have 0-10K monthly listeners</li>
									<li>• You want to learn marketing skills yourself</li>
									<li>
										• You prefer understanding the &quot;why&quot; behind strategies
									</li>
									<li>• Your budget is limited but you have time to invest</li>
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
									<li>• You have 10-50K monthly listeners (or budget to jumpstart)</li>
									<li>• You want professional campaign execution</li>
									<li>• You have $1-3K monthly to invest in ads</li>
									<li>• You&apos;d rather focus on creating than marketing</li>
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
									<li>• You have 50K+ monthly listeners</li>
									<li>• You&apos;re ready for aggressive scaling</li>
									<li>• You have $3-6K monthly marketing budget</li>
									<li>• You want maximum growth with full transparency</li>
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
