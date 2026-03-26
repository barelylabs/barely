'use client';

import { useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';
import {
	ArrowRightIcon,
	ChartBarIcon,
	CheckCircleIcon,
	CreditCardIcon,
	ShoppingCartIcon,
	TruckIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import {
	BarChart3,
	DollarSign,
	Gift,
	Package,
	Ruler,
	ShieldCheck,
} from 'lucide-react';

import { AnimatedSection } from '~/components/animated-section';
import { BentoCard } from '~/components/bento-card';
import { ContactModal } from '~/components/contact-modal';
import { Container } from '~/components/container';
import { MarketingButton } from '~/components/marketing-button';
import { Heading, Subheading } from '~/components/text';
import { ValueCard } from '~/components/value-card';

// Note: metadata must be in a separate file or this must be a server component
// Since we need ContactModal state, we use a client component with head meta tags

function HeroSection({ onDemoClick }: { onDemoClick: () => void }) {
	return (
		<section className='relative overflow-hidden bg-background pb-24 pt-32'>
			{/* Background gradient */}
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
							Direct-to-Fan Sales That{' '}
							<span className='gradient-text'>Actually Convert</span>
						</h1>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
							We built barely.cart because we weren&apos;t happy with the
							conversions we were getting with Shopify. Storefronts are built for
							browsing. Your campaigns deserve a checkout experience built for
							converting.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<div className='mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center'>
							<MarketingButton
								variant='hero-primary'
								href={getAbsoluteUrl('app', 'register?ref=www/cart')}
								glow
							>
								Start Selling Free
							</MarketingButton>
							<MarketingButton variant='hero-secondary' onClick={onDemoClick}>
								Book a Demo
							</MarketingButton>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

function ProblemSection() {
	const shopifyProblems = [
		'Generic storefront with endless browsing',
		'Cart abandonment from distractions',
		'No urgency or scarcity mechanics',
		'Lost attribution from campaign to purchase',
		'No post-purchase monetization',
		'Paying for features you don\u2019t need',
	];

	const cartSolutions = [
		'One dedicated landing page per campaign',
		'Single-product focus eliminates distractions',
		'Order bumps increase average order value',
		'Full attribution from ad click to checkout',
		'Post-purchase upsells triple order value',
		'Only pay for what you sell',
	];

	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>Why We Built This</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						Storefronts Are Built for Browsing.{' '}
						<span className='gradient-text inline-block'>
							Campaigns Are Built for Converting.
						</span>
					</Heading>
					<p className='mx-auto mt-6 max-w-3xl text-lg text-muted-foreground'>
						When you run a direct-to-fan sales campaign, every click matters. A
						Shopify storefront gives fans too many places to wander. A focused
						landing page with an integrated checkout keeps them on the path to
						purchase.
					</p>
				</AnimatedSection>

				<div className='grid gap-8 lg:grid-cols-2'>
					<AnimatedSection animation='fade-up' delay={100}>
						<div className='glass h-full rounded-2xl border border-white/10 p-8'>
							<div className='mb-6 flex items-center gap-3'>
								<div className='rounded-xl bg-destructive/10 p-3'>
									<XCircleIcon className='h-6 w-6 text-destructive' />
								</div>
								<h3 className='text-xl font-semibold text-white'>
									The Shopify Way
								</h3>
							</div>
							<ul className='space-y-4'>
								{shopifyProblems.map(problem => (
									<li key={problem} className='flex items-start gap-3'>
										<XCircleIcon className='mt-0.5 h-5 w-5 shrink-0 text-destructive/70' />
										<span className='text-muted-foreground'>{problem}</span>
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
								<h3 className='text-xl font-semibold text-white'>
									The barely.cart Way
								</h3>
							</div>
							<ul className='space-y-4'>
								{cartSolutions.map(solution => (
									<li key={solution} className='flex items-start gap-3'>
										<CheckCircleIcon className='mt-0.5 h-5 w-5 shrink-0 text-primary/70' />
										<span className='text-muted-foreground'>{solution}</span>
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
				'Drive campaign traffic to a focused landing page built for one goal: getting the fan to checkout. No navigation menus, no distractions.',
			icon: <ShoppingCartIcon className='h-6 w-6' />,
		},
		{
			number: '02',
			title: 'Checkout + Order Bump',
			description:
				'A streamlined checkout with an optional one-click bump offer. Add a sticker, a bonus track, or another CD right at the point of purchase.',
			icon: <CreditCardIcon className='h-6 w-6' />,
		},
		{
			number: '03',
			title: 'Post-Purchase Upsell',
			description:
				'After checkout, present an exclusive offer using the same payment method. One click, no re-entering payment details. This is where AOV skyrockets.',
			icon: <Gift className='h-6 w-6' />,
		},
		{
			number: '04',
			title: 'Success + Attribution',
			description:
				'Custom success page with your branding, social links, and a clear CTA. Every step tracked with full conversion analytics.',
			icon: <ChartBarIcon className='h-6 w-6' />,
		},
	];

	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<Subheading dark>The Funnel</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						A Conversion Path,{' '}
						<span className='gradient-text inline-block'>Not a Storefront</span>
					</Heading>
					<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground'>
						Every campaign gets its own focused checkout funnel. Landing page to
						checkout to upsell to success &mdash; one clear path, maximum
						conversion.
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
									<h3 className='mb-3 text-lg font-semibold text-white'>
										{step.title}
									</h3>
									<p className='text-sm text-muted-foreground'>
										{step.description}
									</p>
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
						<span className='gradient-text inline-block'>
							Sell Direct to Fans
						</span>
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
							description='One checkbox to add a sticker pack, a bonus CD, or a digital download. The easiest way to increase average order value at the point of sale.'
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
							description='After the main purchase, offer an exclusive product using the same payment method. Fans buy with one click &mdash; no re-entering card details. This is where order values triple.'
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
							description='Manage orders, track fulfillment status, and create shipping labels directly in the app. Filter by fulfillment status, search by customer, and ship with integrated label creation.'
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
							description='barely.cart takes a small percentage of product sales only &mdash; never from shipping, handling, or taxes. You always know exactly what you&apos;re paying, on top of standard Stripe processing.'
						/>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={300}>
						<ValueCard
							icon={<BarChart3 className='h-6 w-6' />}
							title='Full-Funnel Analytics'
							description='Track every step: checkout views, email collection, payment info adds, bump rates, upsell conversions, and gross revenue. Know exactly where fans drop off.'
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

function AnalyticsSection() {
	const metrics = [
		{ label: 'Checkout Views', description: 'Total visits to your checkout page' },
		{ label: 'Email Collection Rate', description: 'Fans who enter their email' },
		{ label: 'Payment Info Rate', description: 'Fans who add a payment method' },
		{ label: 'Bump Rate', description: 'Percentage who add the order bump' },
		{ label: 'Upsell Conversion', description: 'Fans who accept the upsell offer' },
		{ label: 'Gross Revenue', description: 'Total sales across all products' },
	];

	return (
		<section className='bg-card py-24'>
			<Container>
				<div className='grid items-center gap-16 lg:grid-cols-2'>
					<AnimatedSection animation='fade-up'>
						<Subheading dark>Analytics</Subheading>
						<Heading as='h2' className='mt-2 text-white'>
							Know Exactly Where{' '}
							<span className='gradient-text inline-block'>Fans Drop Off</span>
						</Heading>
						<p className='mt-6 text-lg text-muted-foreground'>
							Every step of the checkout funnel is tracked. See where fans engage,
							where they hesitate, and where they convert. Use real data to
							optimize every campaign.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={150}>
						<div className='grid grid-cols-2 gap-4'>
							{metrics.map((metric, index) => (
								<div
									key={metric.label}
									className='glass rounded-xl border border-white/10 p-5 transition-all duration-300 hover:border-white/20'
								>
									<div
										className='mb-1 text-sm font-medium text-primary'
										style={{ animationDelay: `${index * 100}ms` }}
									>
										{metric.label}
									</div>
									<p className='text-xs text-muted-foreground'>
										{metric.description}
									</p>
								</div>
							))}
						</div>
					</AnimatedSection>
				</div>
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
							Ready to Sell Direct to Your Fans?
						</h2>
						<p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground'>
							Stop losing conversions to generic storefronts. Build focused
							checkout funnels that turn campaign clicks into customers.
						</p>
						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<MarketingButton
								variant='hero-primary'
								href={getAbsoluteUrl('app', 'register?ref=www/cart-cta')}
								glow
							>
								Start Selling Free
							</MarketingButton>
							<MarketingButton variant='hero-secondary' onClick={onDemoClick}>
								Book a Demo
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
			<ProblemSection />
			<FunnelSection />
			<FeatureDeepDiveSection />
			<CapabilitiesSection />
			<AnalyticsSection />
			<CTASection onDemoClick={() => setShowContactModal(true)} />

			<ContactModal
				show={showContactModal}
				onClose={() => setShowContactModal(false)}
				variant='demo'
			/>
		</main>
	);
}
