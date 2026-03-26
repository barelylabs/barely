'use client';

import { useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ChartBarIcon,
	CheckCircleIcon,
	CreditCardIcon,
	GlobeAltIcon,
	ShoppingCartIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import {
	BarChart3,
	DollarSign,
	Gift,
	Link2,
	Mail,
	Package,
	Ruler,
	ShieldCheck,
	TruckIcon,
} from 'lucide-react';

import { AnimatedSection } from '~/components/animated-section';
import { BentoCard } from '~/components/bento-card';
import { ContactModal } from '~/components/contact-modal';
import { Container } from '~/components/container';
import { MarketingButton } from '~/components/marketing-button';
import { Heading, Subheading } from '~/components/text';
import { ValueCard } from '~/components/value-card';

function HeroSection({ onDemoClick }: { onDemoClick: () => void }) {
	return (
		<section className='relative overflow-hidden bg-background pb-24 pt-32'>
			<div className='absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/15' />

			<Container className='relative z-10'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<Subheading as='div' dark>
							<ShoppingCartIcon className='h-4 w-4' />
							barely.cart
						</Subheading>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={100}>
						<h1 className='mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl'>
							Checkout Funnels Engineered for{' '}
							<span className='gradient-text'>Merch Campaigns</span>
						</h1>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
							A purpose-built checkout experience for direct-to-fan sales. Order bumps,
							one-click post-purchase upsells, and full-funnel analytics &mdash; designed
							to maximize order value on every campaign.
						</p>
						<p className='mx-auto mt-4 max-w-xl text-sm text-muted-foreground/70'>
							Born from running real merch campaigns where traditional storefronts
							weren&apos;t converting.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center'>
							<MarketingButton variant='hero-primary' onClick={onDemoClick} glow>
								Book a Demo
							</MarketingButton>
							<MarketingButton
								variant='hero-secondary'
								href={getAbsoluteUrl('app', 'register?ref=www/cart')}
							>
								Start Selling Free
							</MarketingButton>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function ParadigmSection() {
	const storefrontIssues = [
		'Generic browsing experience with multiple distractions',
		'Cart abandonment from navigation, related products, menus',
		'No mechanism to increase order value at checkout',
		'Lost attribution between campaign click and purchase',
		'No post-purchase monetization path',
	];

	const funnelAdvantages = [
		'Dedicated landing page drives fans to a single checkout',
		'Focused, single-product flow eliminates drop-off points',
		'Order bumps increase average order value at point of sale',
		'Full attribution from ad click through to purchase',
		'Post-purchase upsells capture additional revenue with one click',
	];

	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>The Approach</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Storefronts Are for Browsing.{' '}
						<span className='gradient-text inline-block'>
							Funnels Are for Converting.
						</span>
					</Heading>
					<p className='mx-auto mt-6 max-w-3xl text-lg text-muted-foreground'>
						When you run a direct-to-fan merch campaign, every click matters. A storefront
						gives fans places to wander. A focused checkout funnel keeps them on one path:
						the path to purchase.
					</p>
				</AnimatedSection>

				<div className='grid gap-8 lg:grid-cols-2'>
					<AnimatedSection animation='fade-up' delay={100}>
						<div className='glass h-full rounded-2xl border border-white/10 p-8'>
							<div className='mb-6 flex items-center gap-3'>
								<div className='rounded-xl bg-destructive/10 p-3'>
									<XCircleIcon className='h-6 w-6 text-destructive' />
								</div>
								<h3 className='text-xl font-semibold text-white'>The Storefront Model</h3>
							</div>
							<ul className='space-y-4'>
								{storefrontIssues.map(issue => (
									<li key={issue} className='flex items-start gap-3'>
										<XCircleIcon className='mt-0.5 h-5 w-5 shrink-0 text-destructive/70' />
										<span className='text-muted-foreground'>{issue}</span>
									</li>
								))}
							</ul>
						</div>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass h-full rounded-2xl border border-primary/20 p-8'>
							<div className='mb-6 flex items-center gap-3'>
								<div className='rounded-xl bg-primary/10 p-3'>
									<CheckCircleIcon className='h-6 w-6 text-primary' />
								</div>
								<h3 className='text-xl font-semibold text-white'>The Funnel Model</h3>
							</div>
							<ul className='space-y-4'>
								{funnelAdvantages.map(advantage => (
									<li key={advantage} className='flex items-start gap-3'>
										<CheckCircleIcon className='mt-0.5 h-5 w-5 shrink-0 text-primary/70' />
										<span className='text-muted-foreground'>{advantage}</span>
									</li>
								))}
							</ul>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function FunnelSection() {
	const steps = [
		{
			number: '01',
			title: 'Landing Page',
			description:
				'Drive campaign traffic to a focused landing page with one goal: getting the fan to checkout. Build it with barely.page, your link-in-bio, or any page builder you prefer.',
			icon: <GlobeAltIcon className='h-6 w-6' />,
		},
		{
			number: '02',
			title: 'Checkout + Order Bump',
			description:
				'A streamlined checkout with an optional one-click bump offer. Add a sticker, a bonus track, or another item right at the point of purchase.',
			icon: <CreditCardIcon className='h-6 w-6' />,
		},
		{
			number: '03',
			title: 'Post-Purchase Upsell',
			description:
				'After checkout, present an exclusive offer using the saved payment method. One click to buy &mdash; no re-entering card details. This is where order value climbs.',
			icon: <Gift className='h-6 w-6' />,
		},
		{
			number: '04',
			title: 'Success + Follow-Up',
			description:
				'Custom success page with your branding and a clear next step. Receipt emails sent automatically. Fan added to your email list for future campaigns.',
			icon: <ChartBarIcon className='h-6 w-6' />,
		},
	];

	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>How It Works</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						One Clear Path,{' '}
						<span className='gradient-text inline-block'>Maximum Conversion</span>
					</Heading>
					<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground'>
						Every campaign gets its own checkout funnel. Landing page to checkout to
						upsell to success &mdash; a focused conversion path with multiple revenue
						opportunities at each step.
					</p>
				</AnimatedSection>

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
					{steps.map((step, index) => (
						<AnimatedSection key={step.number} animation='fade-up' delay={index * 100}>
							<div className='glass group relative h-full rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-white/20'>
								<div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
									<div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10' />
								</div>
								<div className='relative z-10'>
									<div className='mb-4 flex items-center justify-between'>
										<div className='inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
											{step.icon}
										</div>
										<span className='font-mono text-sm text-muted-foreground'>
											{step.number}
										</span>
									</div>
									<h3 className='mb-3 text-lg font-semibold text-white'>{step.title}</h3>
									<p className='text-sm text-muted-foreground'>{step.description}</p>
								</div>
								{index < steps.length - 1 && (
									<div className='absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 lg:block'>
										<ArrowRightIcon className='h-5 w-5 text-muted-foreground' />
									</div>
								)}
							</div>
						</AnimatedSection>
					))}
				</div>
			</Container>
		</section>
	);
}

function FeatureDeepDiveSection() {
	return (
		<div className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<Subheading dark>Features</Subheading>
					<Heading as='h3' className='mt-2 max-w-3xl text-white'>
						Everything You Need to{' '}
						<span className='gradient-text inline-block'>Sell Direct to Fans</span>
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
							eyebrow='Cart Funnels'
							title='Build focused checkout experiences'
							description='Create a dedicated funnel for every campaign. Choose your main product, configure an order bump, set up a post-purchase upsell, and customize your success page &mdash; all from one screen.'
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
							description='One checkbox to add a sticker pack, a bonus CD, or a digital download. The simplest way to increase average order value at the point of sale.'
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
							title='One-click, no re-entry'
							description='After the main purchase, present an exclusive product using the saved payment method. Fans buy with one click &mdash; no re-entering card details. A proven way to significantly increase order value.'
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
							eyebrow='Order Management & Fulfillment'
							title='From purchase to doorstep'
							description='Manage orders, track fulfillment status, and create shipping labels directly in the app. Filter by status, search by customer, and ship with integrated label creation.'
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

function CapabilitiesSection() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>Capabilities</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Built for How{' '}
						<span className='gradient-text inline-block'>Artists Actually Sell</span>
					</Heading>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
					<AnimatedSection animation='fade-up' delay={100}>
						<ValueCard
							icon={<DollarSign className='h-6 w-6' />}
							title='Pay-What-You-Want'
							description='Let fans choose their price with configurable minimums. Perfect for digital releases, charity campaigns, or letting superfans show extra support.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={150}>
						<ValueCard
							icon={<TruckIcon className='h-6 w-6' />}
							title='Real-Time Shipping'
							description='Shipping rates calculated in real time based on destination, weight, and dimensions. No more guessing or overcharging on shipping costs.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<ValueCard
							icon={<Ruler className='h-6 w-6' />}
							title='Apparel Sizing & Stock'
							description='Full size range from XS to XXL with per-size stock management. Sell t-shirts, hoodies, and merch bundles with confidence.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={250}>
						<ValueCard
							icon={<ShieldCheck className='h-6 w-6' />}
							title='Transparent Pricing'
							description='barely.cart takes a small percentage of product sales only &mdash; never from shipping, handling, or taxes. You always know exactly what you pay, on top of standard Stripe processing.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<ValueCard
							icon={<BarChart3 className='h-6 w-6' />}
							title='Full-Funnel Analytics'
							description='Track every step from checkout view to purchase. Bump rates, upsell conversions, email collection, revenue &mdash; know exactly where fans drop off and where they convert.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={350}>
						<ValueCard
							icon={<Package className='h-6 w-6' />}
							title='Flexible Fulfillment'
							description={
								<>
									Ship orders yourself with integrated label creation, or let{' '}
									<a
										href={getAbsoluteUrl('nyc', '/services/fulfillment')}
										className='text-primary underline underline-offset-4 transition-colors hover:text-primary/80'
										target='_blank'
										rel='noopener noreferrer'
									>
										Barely Fulfillment
									</a>{' '}
									handle packing and shipping so you can focus on making music.
								</>
							}
						/>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function IntegrationSection() {
	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>Platform Integration</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Not a Standalone Tool.{' '}
						<span className='gradient-text inline-block'>Part of the Stack.</span>
					</Heading>
					<p className='mx-auto mt-6 max-w-3xl text-lg text-muted-foreground'>
						barely.cart connects to the rest of the barely platform &mdash; so your sales
						data, fan relationships, and campaign analytics all live in one place.
					</p>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
					<AnimatedSection animation='fade-up' delay={100}>
						<ValueCard
							icon={<Mail className='h-6 w-6' />}
							title='Email List Growth'
							description='Every buyer is automatically added to your fan list with marketing opt-in. Grow your email list with every sale.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={150}>
						<ValueCard
							icon={<Link2 className='h-6 w-6' />}
							title='Campaign Attribution'
							description='Use barely.link short URLs to track which campaigns, ads, and channels drive the most revenue into your cart funnels.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<ValueCard
							icon={<BarChart3 className='h-6 w-6' />}
							title='Unified Analytics'
							description='See the full fan journey from link click to email open to purchase &mdash; all in one dashboard. No stitching data across platforms.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={250}>
						<ValueCard
							icon={<Mail className='h-6 w-6' />}
							title='Post-Sale Campaigns'
							description='Trigger email flows after purchase. Send follow-ups, request reviews, or promote future drops to fans who already bought.'
						/>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function AnalyticsSection() {
	const funnelSteps = [
		{
			label: 'Checkout Views',
			description: 'Campaign traffic hits the checkout page',
			width: 'w-full',
		},
		{
			label: 'Email Collected',
			description: 'Fan enters their email address',
			width: 'w-[85%]',
		},
		{
			label: 'Shipping Info Added',
			description: 'Fan provides delivery address',
			width: 'w-[70%]',
		},
		{
			label: 'Payment Info Added',
			description: 'Fan enters payment method',
			width: 'w-[60%]',
		},
		{
			label: 'Purchase Completed',
			description: 'Main product + optional bump',
			width: 'w-[45%]',
		},
		{
			label: 'Upsell Converted',
			description: 'Post-purchase offer accepted',
			width: 'w-[25%]',
		},
	];

	return (
		<section className='py-24'>
			<Container>
				<div className='grid items-center gap-16 lg:grid-cols-2'>
					<AnimatedSection animation='fade-up'>
						<Subheading dark>Analytics</Subheading>
						<Heading as='h2' className='mt-2 text-white'>
							See Every Step of the{' '}
							<span className='gradient-text inline-block'>Conversion Funnel</span>
						</Heading>
						<p className='mt-6 text-lg text-muted-foreground'>
							Every interaction is tracked from first page view to final purchase.
							Identify exactly where fans engage, where they drop off, and where to
							optimize. Run campaigns with data, not guesswork.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={150}>
						<div className='glass rounded-2xl border border-white/10 p-8'>
							<div className='space-y-3'>
								{funnelSteps.map((step, index) => (
									<div key={step.label}>
										<div className='mb-1 flex items-baseline justify-between'>
											<span className='text-sm font-medium text-white'>{step.label}</span>
											<span className='text-xs text-muted-foreground'>
												{step.description}
											</span>
										</div>
										<div className='h-3 w-full rounded-full bg-white/5'>
											<div
												className={`h-full rounded-full bg-gradient-to-r from-secondary to-primary ${step.width}`}
												style={{
													opacity: 1 - index * 0.12,
												}}
											/>
										</div>
										{index < funnelSteps.length - 1 && (
											<div className='flex justify-center py-1'>
												<ArrowDownIcon className='h-3 w-3 text-muted-foreground/50' />
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function CredibilitySection() {
	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mx-auto max-w-3xl text-center'>
					<Subheading dark>Built by Barely</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Battle-Tested on{' '}
						<span className='gradient-text inline-block'>Real Merch Campaigns</span>
					</Heading>
					<p className='mt-6 text-lg text-muted-foreground'>
						barely.cart powers the direct-to-fan sales campaigns at Barely, where we run
						professional merch drops for indie artists. Every feature was built to solve a
						real problem we encountered running actual campaigns &mdash; not designed in a
						vacuum.
					</p>
					<p className='mt-4 text-lg text-muted-foreground'>
						The entire platform is{' '}
						<a
							href='https://github.com/barelylabs/barely'
							className='text-primary underline underline-offset-4 transition-colors hover:text-primary/80'
							target='_blank'
							rel='noopener noreferrer'
						>
							open source
						</a>
						. You can see exactly how every feature works, audit the code, and trust that
						there are no black boxes between you and your revenue.
					</p>
				</AnimatedSection>
			</Container>
		</section>
	);
}

function CTASection({ onDemoClick }: { onDemoClick: () => void }) {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<div className='glass rounded-3xl border border-white/10 p-12 text-center'>
						<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
							Ready to Maximize Your Merch Revenue?
						</h2>
						<p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground'>
							Build focused checkout funnels that turn campaign clicks into customers
							&mdash; with order bumps, upsells, and full analytics on every sale.
						</p>
						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<MarketingButton variant='hero-primary' onClick={onDemoClick} glow>
								Book a Demo
							</MarketingButton>
							<MarketingButton
								variant='hero-secondary'
								href={getAbsoluteUrl('app', 'register?ref=www/cart-cta')}
							>
								Start Selling Free
							</MarketingButton>
						</div>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

export default function CartPage() {
	const [showContactModal, setShowContactModal] = useState(false);

	return (
		<main className='overflow-hidden bg-background'>
			<HeroSection onDemoClick={() => setShowContactModal(true)} />
			<ParadigmSection />
			<FunnelSection />
			<FeatureDeepDiveSection />
			<CapabilitiesSection />
			<IntegrationSection />
			<AnalyticsSection />
			<CredibilitySection />
			<CTASection onDemoClick={() => setShowContactModal(true)} />

			<ContactModal
				show={showContactModal}
				onClose={() => setShowContactModal(false)}
				variant='demo'
			/>
		</main>
	);
}
