import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { MarketingButton } from '../../components/marketing/button';
import { OpenSourceBadge } from '../../components/marketing/trust-badges';
import { properYouthCase } from '../../data/case-studies';

export const metadata: Metadata = {
	title: 'Our Tools - barely.ai Platform | Barely',
	description:
		'Stop juggling 10 different platforms. barely.ai brings all your music marketing tools together in one integrated system built specifically for artists.',
};

const toolCategories = [
	{
		name: 'Content Management',
		description: 'Everything in one place',
		tools: [
			{
				name: 'media',
				description: 'Upload and manage images, videos, audio files',
				replaces: 'Dropbox, Google Drive',
			},
			{
				name: 'tracks',
				description: 'Centralized music catalog management',
				replaces: 'Spreadsheets, DistroKid dashboard',
			},
			{
				name: 'mixtapes',
				description: 'Create collections and playlists for campaigns',
				replaces: 'Spotify for Artists, Apple Music for Artists',
			},
		],
	},
	{
		name: 'Marketing Destinations',
		description: 'Professional presence without the complexity',
		tools: [
			{
				name: 'links',
				description: 'Smart short links that track fan behavior',
				replaces: 'Bitly, Rebrandly',
				saves: '$30/month',
			},
			{
				name: 'fm',
				description: 'Streaming smart links for all platforms',
				replaces: 'Linkfire, Feature.fm',
				saves: '$50/month',
			},
			{
				name: 'pages',
				description: 'Landing pages optimized for conversions',
				replaces: 'Squarespace, Wix',
				saves: '$36/month',
			},
			{
				name: 'press',
				description: 'Professional EPKs for media outreach',
				replaces: 'Sonicbids, manual PDFs',
				saves: '$15/month',
			},
		],
	},
	{
		name: 'E-commerce & Merch',
		description: 'Sell directly to your fans',
		tools: [
			{
				name: 'products',
				description: 'Physical and digital product management',
				replaces: 'Shopify products',
			},
			{
				name: 'carts',
				description: 'Custom checkout with pay-what-you-want options',
				replaces: 'Shopify checkout, Bandcamp',
				saves: '$30/month + fees',
			},
			{
				name: 'orders',
				description: 'Complete order management and fulfillment',
				replaces: 'Order management systems',
			},
		],
	},
	{
		name: 'Email Marketing',
		description: 'Build real relationships',
		tools: [
			{
				name: 'templates',
				description: 'Reusable email designs for campaigns',
				replaces: 'ConvertKit templates',
			},
			{
				name: 'flows',
				description: 'Automated sequences triggered by fan actions',
				replaces: 'ConvertKit, Mailchimp',
				saves: '$50-100/month',
			},
			{
				name: 'segments',
				description: 'Smart audience grouping based on behavior',
				replaces: 'Manual tagging in email tools',
			},
		],
	},
	{
		name: 'Fan Management',
		description: 'Know your audience',
		tools: [
			{
				name: 'fans',
				description: 'Central database of all contacts and behavior',
				replaces: 'CRM systems, spreadsheets',
			},
			{
				name: 'groups',
				description: 'Segment by purchases, location, engagement',
				replaces: 'Manual audience management',
			},
			{
				name: 'analytics',
				description: 'See the full fan journey across all touchpoints',
				replaces: 'Google Analytics + manual tracking',
			},
		],
	},
];

const integrationBenefits = [
	{
		title: 'One Login, Everything Connected',
		description:
			'No more juggling passwords or exporting CSVs. Every tool talks to every other tool automatically.',
	},
	{
		title: 'True Attribution Tracking',
		description:
			'See which Instagram post drove which Spotify streams and merch sales. Finally understand your ROI.',
	},
	{
		title: 'Built for Music, Not Generic Business',
		description:
			'Features designed around release cycles, tour routing, and fan behavior - not quarterly sales goals.',
	},
	{
		title: 'Open Source Transparency',
		description:
			'See exactly how everything works. No black boxes, no proprietary algorithms, no surprises.',
	},
];

export default function ToolsPage() {
	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							All Your Music Marketing Tools in One Place
						</H>
						<p className='mx-auto max-w-3xl text-xl text-white/70 md:text-2xl'>
							Stop wasting 2+ hours/week managing 10 different platforms. barely.ai brings
							everything together where every tool talks to every other tool.
						</p>
						<div className='mt-8 flex justify-center'>
							<OpenSourceBadge className='text-lg' />
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Cost Comparison */}
			<section className='bg-white/5 px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<div className='space-y-4 text-center'>
							<H size='3' className='text-3xl md:text-4xl'>
								The Real Cost of Fragmentation
							</H>
							<div className='grid gap-4 pt-8 md:grid-cols-2'>
								<div className='rounded-lg bg-red-500/10 p-6 text-left'>
									<p className='mb-2 text-sm uppercase tracking-wide text-red-400'>
										Traditional Stack
									</p>
									<p className='mb-4 text-3xl font-bold'>$161-291/month</p>
									<ul className='space-y-2 text-sm text-white/70'>
										<li>• Linkfire/Feature.fm: $27-50</li>
										<li>• ConvertKit: $50-100</li>
										<li>• Squarespace: $18-40</li>
										<li>• Shopify: $30+</li>
										<li>• Bitly: $10-30</li>
										<li>• Sonicbids: $10+</li>
										<li>• Analytics tools: $15+</li>
									</ul>
									<p className='mt-4 text-xs text-white/50'>
										Plus hours of manual work connecting data
									</p>
								</div>
								<div className='rounded-lg bg-green-500/10 p-6 text-left'>
									<p className='mb-2 text-sm uppercase tracking-wide text-green-400'>
										barely.ai
									</p>
									<p className='mb-4 text-3xl font-bold'>$24-149/month</p>
									<ul className='space-y-2 text-sm text-white/70'>
										<li>✓ All tools included</li>
										<li>✓ Automatic integration</li>
										<li>✓ Music-specific features</li>
										<li>✓ True attribution tracking</li>
										<li>✓ No data silos</li>
										<li>✓ Open source</li>
										<li>✓ Self-hosting option</li>
									</ul>
									<p className='mt-4 text-xs text-green-400'>
										Save 2+ hours/week on manual tasks
									</p>
								</div>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Tool Categories */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-4xl md:text-5xl'>
							Complete Feature Set
						</H>
					</AnimatedSection>

					<div className='space-y-12'>
						{toolCategories.map((category, index) => (
							<AnimatedSection
								key={category.name}
								animation='fade-up'
								delay={index * 100}
							>
								<div className='rounded-lg bg-white/5 p-8'>
									<H size='3' className='mb-2 text-2xl md:text-3xl'>
										{category.name}
									</H>
									<p className='mb-6 text-white/60'>{category.description}</p>
									<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
										{category.tools.map(tool => (
											<div key={tool.name} className='rounded bg-black/30 p-4'>
												<p className='mb-1 font-mono text-lg text-cyan-400'>
													{tool.name}
												</p>
												<p className='mb-2 text-sm text-white/80'>{tool.description}</p>
												{tool.replaces && (
													<p className='text-xs text-white/50'>
														Replaces: {tool.replaces}
													</p>
												)}
												{tool.saves && (
													<p className='mt-1 text-xs font-semibold text-green-400'>
														Saves {tool.saves}
													</p>
												)}
											</div>
										))}
									</div>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Integration Benefits */}
			<section className='bg-gradient-to-b from-purple-500/10 to-transparent px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-12 text-center text-4xl md:text-5xl'>
							Why Integration Beats Features
						</H>
					</AnimatedSection>

					<div className='grid gap-8 md:grid-cols-2'>
						{integrationBenefits.map((benefit, index) => (
							<AnimatedSection
								key={benefit.title}
								animation='fade-up'
								delay={index * 100}
							>
								<div className='rounded-lg bg-white/5 p-6'>
									<H size='4' className='mb-3 text-xl'>
										{benefit.title}
									</H>
									<p className='text-white/70'>{benefit.description}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Real Example */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-8 text-center text-4xl md:text-5xl'>
							See It In Action
						</H>
						<div className='rounded-lg bg-white/5 p-8'>
							<H size='3' className='mb-6 text-2xl'>
								{properYouthCase.featuredHighlights?.workflowExample?.title}
							</H>
							<div className='space-y-4'>
								{properYouthCase.featuredHighlights?.workflowExample?.steps.map(step => (
									<div key={step.number} className='flex items-start gap-4'>
										<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400'>
											{step.number}
										</span>
										<div>
											<p className='font-semibold'>{step.title}</p>
											<p
												className='text-sm text-white/70'
												dangerouslySetInnerHTML={{
													__html: step.description.replace(
														/media|links|page/g,
														match => `<span class="font-mono">${match}</span>`,
													),
												}}
											/>
										</div>
									</div>
								))}
								<div className='flex items-start gap-4'>
									<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400'>
										✓
									</span>
									<div>
										<p className='font-semibold'>Results Tracked Automatically</p>
										<p className='text-sm text-white/70'>
											2,341 clicks → 1,832 streams → 234 emails → 67 purchases
										</p>
										<p className='mt-2 text-sm font-semibold text-green-400'>
											All in one dashboard. Time spent: 15 minutes.
										</p>
									</div>
								</div>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-6 text-4xl md:text-5xl'>
							Ready to Simplify Your Marketing Stack?
						</H>
						<p className='mb-8 text-xl text-white/70'>
							Whether you&apos;re tired of juggling subscriptions or just starting out,
							barely.ai gives you professional tools that actually work together.
						</p>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<a href='https://barely.ai' target='_blank' rel='noopener noreferrer'>
								<MarketingButton
									marketingLook='hero-primary'
									size='lg'
									className='min-w-[200px]'
								>
									Try barely.ai Free
								</MarketingButton>
							</a>
							<Link href='/blog/the-exact-tech-stack-we-use-for-music-marketing'>
								<MarketingButton
									marketingLook='scientific'
									size='lg'
									className='min-w-[200px]'
								>
									Read the Deep Dive
								</MarketingButton>
							</Link>
						</div>
						<p className='mt-6 text-sm text-white/50'>
							Open source • Self-hosting available • No lock-in
						</p>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
