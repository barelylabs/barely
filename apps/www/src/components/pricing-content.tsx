'use client';

import { useState } from 'react';
import { WORKSPACE_PLANS } from '@barely/const';
import { cn, getAbsoluteUrl } from '@barely/utils';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { AnimatedSection } from './animated-section';
import { Container } from './container';
import { Footer } from './footer';
import { MarketingButton } from './marketing-button';
import { Heading, Lead, Subheading } from './text';

// Get plans from constants and transform them for UI
const freePlan = WORKSPACE_PLANS.get('free');
const bedroomPlan = WORKSPACE_PLANS.get('bedroom');
const risingPlan = WORKSPACE_PLANS.get('rising');
const breakoutPlan = WORKSPACE_PLANS.get('breakout');
const bedroomPlusPlan = WORKSPACE_PLANS.get('bedroom.plus');
const risingPlusPlan = WORKSPACE_PLANS.get('rising.plus');
const breakoutPlusPlan = WORKSPACE_PLANS.get('breakout.plus');

// Helper function to get analytics retention display string
const getAnalyticsRetentionDisplay = (days: number) => {
	if (days === 30) return '30 days';
	if (days === 365) return '1 year';
	if (days === 365 * 3) return '3 years';
	if (days === Number.MAX_SAFE_INTEGER) return 'Lifetime';
	return `${days} days`;
};

// Helper function to get team members display
const getTeamMembersDisplay = (members: number) => {
	if (members === Number.MAX_SAFE_INTEGER) return 'Unlimited';
	return members.toString();
};

// Helper function to get support level display
const getSupportDisplay = (plan: PlanFromMap) => {
	if (plan.id.includes('.plus')) {
		if (plan.id === 'bedroom.plus') return 'Email (48hr) + Bi-weekly Coaching';
		if (plan.id === 'rising.plus') return 'Priority (24hr) + Monthly Strategy Calls';
		if (plan.id === 'breakout.plus') return 'Chat + Priority Support';
	}
	if (plan.id === 'free') return 'Community';
	if (plan.supportLevel === 'priority') return 'Priority (24hr)';
	return 'Email (48hr)';
};

// Transform plan data for UI
type PlanFromMap = NonNullable<ReturnType<typeof WORKSPACE_PLANS.get>>;
const transformPlanForUI = (plan: PlanFromMap, featured = false) => ({
	id: plan.id,
	name: plan.name,
	price: {
		monthly: plan.price.monthly.amount,
		yearly: Math.round(plan.price.yearly.amount / 12),
	},
	description: plan.description.split('.')[0], // Get first sentence
	icon:
		plan.id === 'free' ? '🆓'
		: plan.id.includes('bedroom') ? '🎧'
		: plan.id.includes('rising') ? '📈'
		: '🚀',
	features: {
		teamMembers: getTeamMembersDisplay(plan.usageLimits.members),
		fanDatabase: plan.usageLimits.fans.toLocaleString(),
		smartLinksPerMonth: plan.usageLimits.newLinksPerMonth.toLocaleString(),
		emailsPerMonth: plan.usageLimits.emailsPerMonth.toLocaleString(),
		analyticsRetention: getAnalyticsRetentionDisplay(plan.analyticsRetentionDays),
		support: getSupportDisplay(plan),
		merchTransactionFee: `${plan.cartFeePercentage}%`,
		customBranding: plan.id !== 'free',
		apiAccess: plan.id !== 'free' && !plan.id.includes('bedroom'),
		abTesting: plan.id === 'breakout' || plan.id === 'breakout.plus',
		whiteLabel: plan.id === 'breakout' || plan.id === 'breakout.plus',
		// Plus plan specific features
		...(plan.id === 'bedroom.plus' && {
			coaching: 'Bi-weekly 30-min calls',
			strategy: 'Custom monthly campaign blueprints',
			campaigns: 'DIY with guidance',
		}),
		...(plan.id === 'rising.plus' && {
			coaching: 'Monthly strategy calls',
			strategy: 'Revenue optimization',
			campaigns: 'Up to 2 campaigns/month',
			adSpend: '$1-3K ad spend management',
		}),
		...(plan.id === 'breakout.plus' && {
			coaching: 'Bi-weekly deep dives',
			strategy: 'Advanced growth engineering',
			campaigns: 'Full campaign execution',
			adSpend: '$3-6K ad spend management',
		}),
	},
	cta: `Start ${plan.name}`,
	featured,
});

const standardTiers = [
	bedroomPlan && transformPlanForUI(bedroomPlan),
	risingPlan && transformPlanForUI(risingPlan, true),
	breakoutPlan && transformPlanForUI(breakoutPlan),
].filter(Boolean) as ReturnType<typeof transformPlanForUI>[];

const plusTiers = [
	bedroomPlusPlan && transformPlanForUI(bedroomPlusPlan),
	risingPlusPlan && transformPlanForUI(risingPlusPlan, true),
	breakoutPlusPlan && transformPlanForUI(breakoutPlusPlan),
].filter(Boolean) as ReturnType<typeof transformPlanForUI>[];

const freeTier = freePlan ? transformPlanForUI(freePlan) : null;

const allFeatures = [
	{ key: 'teamMembers', label: 'Team Members' },
	{ key: 'fanDatabase', label: 'Fan Database' },
	{ key: 'smartLinksPerMonth', label: 'Smart Links/Month' },
	{ key: 'emailsPerMonth', label: 'Emails/Month' },
	{ key: 'analyticsRetention', label: 'Analytics Retention' },
	{ key: 'support', label: 'Support' },
	{ key: 'merchTransactionFee', label: 'Merch Transaction Fee' },
	{ key: 'customBranding', label: 'Custom Branding' },
	{ key: 'apiAccess', label: 'API Access' },
	{ key: 'abTesting', label: 'A/B Testing' },
	{ key: 'whiteLabel', label: 'White Label' },
	{ key: 'coaching', label: 'Coaching Calls' },
	{ key: 'strategy', label: 'Strategy Sessions' },
	{ key: 'campaigns', label: 'Campaign Support' },
	{ key: 'adSpend', label: 'Ad Spend Management' },
];

function Header({
	billingPeriod,
	setBillingPeriod,
	showPlusPlans,
	setShowPlusPlans,
}: {
	billingPeriod: 'monthly' | 'yearly';
	setBillingPeriod: (period: 'monthly' | 'yearly') => void;
	showPlusPlans: boolean;
	setShowPlusPlans: (show: boolean) => void;
}) {
	return (
		<Container className='pb-16 pt-24'>
			<AnimatedSection animation='fade-up' className='text-center'>
				<Heading as='h1' className='text-white'>
					Transparent Pricing. <span className='gradient-text'>No Hidden Fees.</span>
				</Heading>
				<Lead className='mx-auto mt-6 max-w-3xl text-muted-foreground'>
					{showPlusPlans ?
						'Combine barely.ai tools with expert coaching and campaign management from Barely NYC. Let us handle the growth while you focus on the music.'
					:	'All features included at every tier. Just pay for the capacity you need.'}
				</Lead>

				{/* Toggle Container - Full width on desktop, centered on mobile */}
				<div className='mx-auto mt-16 max-w-5xl'>
					<div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
						{/* Plan Type Toggle - Larger */}
						<div className='flex flex-col items-center lg:items-start'>
							<div className='glass inline-flex rounded-lg border border-white/10 p-1'>
								<button
									onClick={() => setShowPlusPlans(false)}
									className={cn(
										'relative rounded-md px-8 py-4 transition-all duration-300 sm:px-12 lg:py-5',
										!showPlusPlans ? 'bg-primary shadow-lg' : 'hover:bg-white/5',
									)}
								>
									<div className='flex flex-col items-start gap-1'>
										<span
											className={cn(
												'text-2xl font-bold',
												!showPlusPlans ? 'text-white' : 'text-white/70',
											)}
										>
											DIY
										</span>
										<span
											className={cn(
												'hidden text-sm lg:block',
												!showPlusPlans ? 'text-white/90' : 'text-muted-foreground',
											)}
										>
											Access to tools
										</span>
									</div>
								</button>
								<button
									onClick={() => setShowPlusPlans(true)}
									className={cn(
										'relative rounded-md px-8 py-4 transition-all duration-300 sm:px-12 lg:py-5',
										showPlusPlans ? 'bg-primary shadow-lg' : 'hover:bg-white/5',
									)}
								>
									<div className='flex flex-col items-start gap-1'>
										<span
											className={cn(
												'text-2xl font-bold',
												showPlusPlans ? 'text-white' : 'text-white/70',
											)}
										>
											Agency
										</span>
										<span
											className={cn(
												'hidden text-sm lg:block',
												showPlusPlans ? 'text-white/90' : 'text-muted-foreground',
											)}
										>
											Tools + coaching & campaigns
										</span>
									</div>
								</button>
							</div>

							{/* Mobile subtitle below toggle */}
							<p className='mt-3 text-sm text-primary transition-all duration-300 lg:hidden'>
								{showPlusPlans ? 'Tools + coaching & campaigns' : 'Access to tools'}
							</p>
						</div>

						{/* Billing Toggle - Smaller */}
						<div className='flex justify-center lg:justify-end'>
							<div className='inline-flex rounded-lg border border-white/10 bg-white/5 p-1'>
								<button
									onClick={() => setBillingPeriod('monthly')}
									className={cn(
										'rounded-md px-5 py-2 text-sm font-medium transition-all duration-300',
										billingPeriod === 'monthly' ?
											'bg-primary text-white'
										:	'text-muted-foreground hover:text-white',
									)}
								>
									Monthly
								</button>
								<button
									onClick={() => setBillingPeriod('yearly')}
									className={cn(
										'rounded-md px-5 py-2 text-sm font-medium transition-all duration-300',
										billingPeriod === 'yearly' ?
											'bg-primary text-white'
										:	'text-muted-foreground hover:text-white',
									)}
								>
									Yearly (2 months free)
								</button>
							</div>
						</div>
					</div>
				</div>
			</AnimatedSection>
		</Container>
	);
}

function PricingCards({
	billingPeriod,
	showPlusPlans,
}: {
	billingPeriod: 'monthly' | 'yearly';
	showPlusPlans: boolean;
}) {
	const tiers = showPlusPlans ? plusTiers : standardTiers;

	return (
		<section className='pb-24 pt-10'>
			<Container>
				{/* Main pricing tiers */}
				<div className='grid gap-8 lg:grid-cols-3'>
					{tiers.map((tier, index) => (
						<AnimatedSection key={tier.id} animation='fade-up' delay={index * 100}>
							<div
								className={cn(
									'relative rounded-2xl p-8 transition-all duration-300',
									'glass border',
									tier.featured ?
										'scale-105 border-primary shadow-lg shadow-primary/20'
									:	'border-white/10 hover:border-white/20',
								)}
							>
								{tier.featured && (
									<div className='absolute -top-4 left-1/2 -translate-x-1/2'>
										<span className='rounded-full bg-primary px-4 py-1 text-xs font-medium text-white transition-colors duration-300'>
											Most Popular
										</span>
									</div>
								)}

								<div className='text-center'>
									<div className='mb-2 text-4xl'>{tier.icon}</div>
									<h3 className='text-xl font-semibold text-white'>{tier.name}</h3>
									<p className='mt-2 text-sm text-muted-foreground'>{tier.description}</p>
								</div>

								<div className='mt-6 text-center'>
									<motion.div
										key={`${billingPeriod}-${showPlusPlans}`}
										initial={{ y: 20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.3 }}
										className='text-4xl font-bold text-white'
									>
										$
										{billingPeriod === 'monthly' ? tier.price.monthly : tier.price.yearly}
										<span className='text-lg font-normal text-muted-foreground'>/mo</span>
									</motion.div>
								</div>

								<MarketingButton
									href={`/sign-up?plan=${tier.id}`}
									variant={tier.featured ? 'hero-primary' : 'hero-secondary'}
									className='mt-6 w-full'
								>
									{tier.cta}
								</MarketingButton>

								<ul className='mt-8 space-y-3'>
									{(showPlusPlans ?
										allFeatures
											.filter(f => !['abTesting', 'whiteLabel'].includes(f.key))
											.slice(0, 9)
									:	allFeatures.slice(0, 7)
									).map(feature => {
										const value =
											tier.features[feature.key as keyof typeof tier.features];
										if (value === undefined) return null;
										return (
											<li key={feature.key} className='flex items-center gap-2 text-sm'>
												<span className='text-muted-foreground'>{feature.label}:</span>
												<span className='font-medium text-white'>{value.toString()}</span>
											</li>
										);
									})}
								</ul>
							</div>
						</AnimatedSection>
					))}
				</div>

				{/* Free tier - Full width */}
				{freeTier && (
					<AnimatedSection animation='fade-up' delay={400} className='mt-12'>
						<div className='glass rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-white/20'>
							<div>
								{/* Top section with title, price and button */}
								<div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
									<div>
										<div className='mb-2 flex items-center gap-3'>
											<span className='text-4xl'>{freeTier.icon}</span>
											<h3 className='text-2xl font-semibold text-white'>
												{freeTier.name}
											</h3>
										</div>
										<p className='text-lg text-muted-foreground'>
											${freeTier.price.monthly} forever – {freeTier.description}
										</p>
									</div>

									{/* CTA button aligned with title section */}
									<div className='lg:ml-8'>
										<MarketingButton
											href={getAbsoluteUrl('app', '/register')}
											variant='hero-secondary'
											className='w-full lg:w-auto'
										>
											{freeTier.cta}
										</MarketingButton>
									</div>
								</div>

								{/* Features grid */}
								<div className='grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4'>
									{[
										{
											icon: '✓',
											label: `${freeTier.features.smartLinksPerMonth} smart links/mo`,
										},
										{ icon: '✓', label: `${freeTier.features.emailsPerMonth} emails/mo` },
										{ icon: '✓', label: `${freeTier.features.fanDatabase} fan database` },
										{
											icon: '✓',
											label: `${freeTier.features.analyticsRetention} analytics`,
										},
										{ icon: '✓', label: `${freeTier.features.teamMembers} team member` },
										{ icon: '✓', label: 'Community support' },
										{ icon: '✓', label: 'Basic features' },
										{ icon: '✓', label: 'API access' },
									].map((item, index) => (
										<div key={index} className='flex items-center gap-2'>
											<span className='text-success'>{item.icon}</span>
											<span className='text-sm text-muted-foreground'>{item.label}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</AnimatedSection>
				)}
			</Container>
		</section>
	);
}

function ComparisonTable({ showPlusPlans }: { showPlusPlans: boolean }) {
	const tiers = showPlusPlans ? plusTiers : standardTiers;
	const allTiers = freeTier ? [freeTier, ...tiers] : tiers;

	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading>Detailed Comparison</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Every feature, every tier
					</Heading>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={200}>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b border-white/10'>
									<th className='px-4 py-4 text-left text-white'>Feature</th>
									{allTiers.map(tier => (
										<th key={tier.id} className='px-4 py-4 text-center'>
											<div className='font-semibold text-white'>{tier.name}</div>
											<div className='text-sm text-muted-foreground'>
												${tier.price.monthly}/mo
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{allFeatures.map((feature, _index) => {
									// Skip coaching features for standard plans
									if (
										!showPlusPlans &&
										['coaching', 'strategy', 'campaigns', 'adSpend'].includes(feature.key)
									) {
										return null;
									}

									return (
										<tr key={feature.key} className='border-b border-white/5'>
											<td className='px-4 py-4 text-muted-foreground'>{feature.label}</td>
											{allTiers.map(tier => {
												const value =
													tier.features[feature.key as keyof typeof tier.features];
												return (
													<td key={tier.id} className='px-4 py-4 text-center'>
														{value === undefined ?
															<span className='text-muted-foreground/50'>—</span>
														: typeof value === 'boolean' ?
															value ?
																<Check className='mx-auto h-5 w-5 text-success' />
															:	<X className='mx-auto h-5 w-5 text-muted-foreground/50' />
														:	<span className='text-sm text-white'>{value}</span>}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

function CostCalculator() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-4xl'>
					<div className='glass rounded-2xl p-12 text-center'>
						<Subheading>Tool Stack Cost Calculator</Subheading>
						<Heading as='h2' className='mb-6 mt-2 text-white'>
							See How Much You're <span className='gradient-text'>Overpaying</span>
						</Heading>

						<div className='mt-8 grid gap-8 md:grid-cols-2'>
							<div className='text-left'>
								<h3 className='mb-4 text-lg font-semibold text-white'>
									Common Tool Stack:
								</h3>
								<ul className='space-y-2 text-muted-foreground'>
									<li className='flex justify-between'>
										<span>Linkfire Pro:</span>
										<span>$27/month</span>
									</li>
									<li className='flex justify-between'>
										<span>ConvertKit:</span>
										<span>$50/month</span>
									</li>
									<li className='flex justify-between'>
										<span>Squarespace:</span>
										<span>$36/month</span>
									</li>
									<li className='flex justify-between'>
										<span>Basic Analytics:</span>
										<span>$20/month</span>
									</li>
									<li className='flex justify-between border-t border-white/10 pt-2 font-semibold text-white'>
										<span>Total:</span>
										<span>$133/month</span>
									</li>
								</ul>
							</div>

							<div className='text-left'>
								<h3 className='mb-4 text-lg font-semibold text-white'>
									barely.ai Rising Tier:
								</h3>
								<ul className='space-y-2 text-muted-foreground'>
									<li className='flex justify-between'>
										<span>Everything included:</span>
										<span>$79/month</span>
									</li>
									<li className='mt-8 flex justify-between font-semibold text-success'>
										<span>You Save:</span>
										<span>$54/month ($648/year)</span>
									</li>
								</ul>
							</div>
						</div>

						<MarketingButton
							href={getAbsoluteUrl('app', '/register')}
							variant='hero-primary'
							className='mt-8'
							glow
						>
							Start Saving Today
						</MarketingButton>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

function FAQs() {
	const faqs = [
		{
			question: 'Can I change plans anytime?',
			answer:
				"Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, you'll receive account credit.",
		},
		{
			question: 'What payment methods do you accept?',
			answer:
				'We accept all major credit cards, debit cards, and bank transfers for annual plans. All payments are processed securely through Stripe.',
		},
		{
			question: 'Is there a setup fee?',
			answer:
				"No setup fees ever. Start free, upgrade when you're ready. Cancel anytime with no penalties.",
		},
		{
			question: 'What happens if I exceed my limits?',
			answer:
				"We'll notify you when you're approaching limits and help you upgrade to the right plan. We never cut off service unexpectedly.",
		},
		{
			question: 'Do you offer discounts for nonprofits?',
			answer:
				'Yes! We offer 30% off for registered nonprofit organizations supporting musicians. Contact us for details.',
		},
		{
			question: 'Can I self-host barely.ai?',
			answer:
				'Yes! As an open-source platform, you can self-host barely.ai. Check our documentation for setup guides.',
		},
	];

	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading>FAQs</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Common questions answered
					</Heading>
				</AnimatedSection>

				<div className='mx-auto max-w-3xl'>
					{faqs.map((faq, index) => (
						<AnimatedSection key={index} animation='fade-up' delay={index * 50}>
							<div className='mb-8'>
								<h3 className='mb-2 text-lg font-semibold text-white'>{faq.question}</h3>
								<p className='text-muted-foreground'>{faq.answer}</p>
							</div>
						</AnimatedSection>
					))}
				</div>
			</Container>
		</section>
	);
}

function FutureFeatures() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='text-center'>
					<div className='glass mx-auto max-w-4xl rounded-2xl p-12'>
						<Subheading>Coming Soon</Subheading>
						<Heading as='h2' className='mb-6 mt-2 text-white'>
							AI-Powered Optimization
						</Heading>
						<p className='mb-8 text-lg text-muted-foreground'>
							Rising+ tiers will include AI features for campaign optimization, content
							suggestions, and predictive analytics. All current features remain the same
							- AI is pure addition.
						</p>
						<MarketingButton href='/updates' variant='hero-secondary'>
							Get Updates
						</MarketingButton>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

export function PricingContent() {
	const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
	const [showPlusPlans, setShowPlusPlans] = useState(false);

	// Apply purple theme for Agency mode
	const themeClass = showPlusPlans ? 'pricing-nyc-theme' : '';

	return (
		<main className={cn('overflow-hidden transition-colors duration-300', themeClass)}>
			<Header
				billingPeriod={billingPeriod}
				setBillingPeriod={setBillingPeriod}
				showPlusPlans={showPlusPlans}
				setShowPlusPlans={setShowPlusPlans}
			/>
			<PricingCards billingPeriod={billingPeriod} showPlusPlans={showPlusPlans} />
			<ComparisonTable showPlusPlans={showPlusPlans} />
			<CostCalculator />
			<FAQs />
			<FutureFeatures />
			<Footer />
		</main>
	);
}
