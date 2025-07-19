import {
	BoltIcon,
	ChartBarIcon,
	EnvelopeIcon,
	GlobeAltIcon,
	LinkIcon,
	ShoppingCartIcon,
} from '@heroicons/react/24/outline';

import { AnimatedSection } from '~/components/animated-section';
import { Container } from '~/components/container';
import { MarketingButton } from '~/components/marketing-button';
import { ValueCard } from '~/components/value-card';

const features = [
	{
		icon: <LinkIcon className='h-6 w-6' />,
		title: 'Smart Links',
		description:
			'Replace Linkfire with intelligent routing that drives more conversions and gives you deeper insights into fan behavior.',
		replaces: 'Linkfire, Toneden',
		benefits: ['Higher conversion rates', 'Better analytics', 'Custom branding'],
	},
	{
		icon: <EnvelopeIcon className='h-6 w-6' />,
		title: 'Email Marketing',
		description:
			'Ditch ConvertKit and Mailchimp. Build targeted campaigns that actually convert fans into lifelong supporters.',
		replaces: 'ConvertKit, Mailchimp, Klaviyo',
		benefits: ['Music-focused templates', 'Fan segmentation', 'Release automation'],
	},
	{
		icon: <GlobeAltIcon className='h-6 w-6' />,
		title: 'Landing Pages',
		description:
			'Skip Squarespace complexity. Create stunning, converting pages for releases, tours, and merch in minutes.',
		replaces: 'Squarespace, Wix, Linktree',
		benefits: ['Music industry templates', 'Mobile optimized', 'Built-in analytics'],
	},
	{
		icon: <ShoppingCartIcon className='h-6 w-6' />,
		title: 'E-commerce',
		description:
			'Replace Shopify and Big Cartel with a platform built specifically for selling music and merch.',
		replaces: 'Shopify, Big Cartel, Bandcamp',
		benefits: ['Lower fees', 'Music-focused checkout', 'Fan data integration'],
	},
	{
		icon: <ChartBarIcon className='h-6 w-6' />,
		title: 'Unified Analytics',
		description:
			'Stop jumping between platforms. Get complete insights across all your marketing channels in one dashboard.',
		replaces: 'Google Analytics, individual platform analytics',
		benefits: ['Cross-platform tracking', 'Fan journey mapping', 'ROI optimization'],
	},
	{
		icon: <BoltIcon className='h-6 w-6' />,
		title: 'Marketing Automation',
		description:
			'Replace Zapier with music industry automations that work out of the box. No complex setup required.',
		replaces: 'Zapier, custom integrations',
		benefits: ['Pre-built workflows', 'Release automation', 'Fan engagement sequences'],
	},
];

export default function FeaturesPage() {
	return (
		<main className='overflow-hidden bg-background'>
			{/* Hero Section */}
			<Container className='pb-16 pt-24'>
				<AnimatedSection animation='fade-up' className='text-center'>
					<h1 className='mb-6 text-4xl font-bold text-white md:text-6xl'>
						Everything You Need to{' '}
						<span className='bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent'>
							Grow Your Music Career
						</span>
					</h1>
					<p className='mx-auto mb-8 max-w-3xl text-xl text-muted-foreground'>
						Replace your entire tool stack with one platform built specifically for
						musicians. Save money, save time, and get better results.
					</p>
					<div className='flex flex-col justify-center gap-4 sm:flex-row'>
						<MarketingButton variant='hero-primary' href='/pricing' glow>
							Start Free Today
						</MarketingButton>
						<MarketingButton variant='hero-secondary' href='/company'>
							See How It Works
						</MarketingButton>
					</div>
				</AnimatedSection>
			</Container>

			{/* Features Grid */}
			<Container className='py-24'>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
						Six Tools. One Platform. Endless Possibilities.
					</h2>
					<p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
						Stop paying for multiple tools that don't talk to each other. Get everything
						you need in one integrated platform.
					</p>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
					{features.map((feature, index) => (
						<AnimatedSection key={feature.title} animation='fade-up' delay={index * 100}>
							<div className='glass group relative h-full overflow-hidden rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-white/20'>
								{/* Hover gradient */}
								<div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
									<div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10' />
								</div>

								{/* Content */}
								<div className='relative z-10'>
									<div className='mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
										{feature.icon}
									</div>
									<h3 className='mb-3 text-xl font-semibold text-white'>
										{feature.title}
									</h3>
									<p className='mb-4 text-muted-foreground'>{feature.description}</p>

									{/* Replaces section */}
									<div className='mb-4'>
										<span className='text-sm font-medium text-secondary'>Replaces:</span>
										<p className='text-sm text-muted-foreground'>{feature.replaces}</p>
									</div>

									{/* Benefits */}
									<div>
										<span className='text-sm font-medium text-primary'>
											Key Benefits:
										</span>
										<ul className='mt-1 text-sm text-muted-foreground'>
											{feature.benefits.map(benefit => (
												<li key={benefit} className='flex items-center gap-2'>
													<div className='h-1.5 w-1.5 rounded-full bg-primary' />
													{benefit}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</AnimatedSection>
					))}
				</div>
			</Container>

			{/* Integration Benefits */}
			<Container className='py-24'>
				<AnimatedSection animation='fade-up' className='text-center'>
					<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
						The Power of Integration
					</h2>
					<p className='mx-auto mb-12 max-w-2xl text-lg text-muted-foreground'>
						When your tools work together, magic happens. Get insights and automation
						that's impossible with separate platforms.
					</p>

					<div className='mb-12 grid gap-8 md:grid-cols-3'>
						<ValueCard
							icon={<ChartBarIcon className='h-6 w-6' />}
							title='Complete Fan Journey'
							description='Track every interaction from first click to final purchase across all your marketing channels.'
						/>
						<ValueCard
							icon={<BoltIcon className='h-6 w-6' />}
							title='Smart Automation'
							description='Trigger email campaigns based on link clicks, send merch offers after purchases, and more.'
						/>
						<ValueCard
							icon={<LinkIcon className='h-6 w-6' />}
							title='Cross-Platform Data'
							description='Use insights from your landing pages to improve your email campaigns and vice versa.'
						/>
					</div>

					<MarketingButton variant='hero-primary' href='/pricing' glow>
						See Pricing & Get Started
					</MarketingButton>
				</AnimatedSection>
			</Container>

			{/* CTA Section */}
			<Container className='py-24'>
				<AnimatedSection animation='fade-up'>
					<div className='glass rounded-3xl border border-white/10 p-12 text-center'>
						<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
							Ready to Simplify Your Music Marketing?
						</h2>
						<p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground'>
							Join thousands of artists who've replaced their tool stack with barely.io.
							Start free and see the difference integration makes.
						</p>
						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<MarketingButton variant='hero-primary' href='/pricing' glow>
								Start Your Free Trial
							</MarketingButton>
							<MarketingButton variant='hero-secondary' href='/company'>
								Book a Demo
							</MarketingButton>
						</div>
					</div>
				</AnimatedSection>
			</Container>
		</main>
	);
}
