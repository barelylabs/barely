'use client';

import {
	ChartBarIcon,
	CurrencyDollarIcon,
	EnvelopeIcon,
	MusicalNoteIcon,
	StarIcon,
	UsersIcon,
} from '@heroicons/react/24/outline';

import { AnimatedNumber } from './animated-number';
import { AnimatedSection } from './animated-section';
import { Container } from './container';
import { MarketingButton } from './marketing-button';

const stats = [
	{
		icon: <UsersIcon className='h-6 w-6' />,
		value: 25000,
		suffix: '+',
		label: 'Active Artists',
		description: 'Musicians trust barely.io',
	},
	{
		icon: <MusicalNoteIcon className='h-6 w-6' />,
		value: 2.3,
		suffix: 'M+',
		label: 'Songs Promoted',
		description: 'Releases marketed successfully',
	},
	{
		icon: <CurrencyDollarIcon className='h-6 w-6' />,
		value: 500000,
		prefix: '$',
		suffix: '+',
		label: 'Revenue Generated',
		description: 'In additional artist income',
	},
	{
		icon: <EnvelopeIcon className='h-6 w-6' />,
		value: 98,
		suffix: '%',
		label: 'Email Deliverability',
		description: 'Industry-leading rates',
	},
];

const successStories = [
	{
		artist: 'Midnight Echoes',
		genre: 'Indie Electronic',
		achievement: 'Grew from 2K to 100K monthly listeners',
		timeframe: '8 months',
		metric: '+4900%',
		metricLabel: 'Growth',
		quote:
			"barely.io's automation let me focus on music while my audience grew exponentially.",
	},
	{
		artist: 'Luna Park',
		genre: 'Dream Pop',
		achievement: 'Generated $50K in merch sales',
		timeframe: '6 months',
		metric: '$50K',
		metricLabel: 'Revenue',
		quote:
			'The integrated e-commerce made selling merch effortless. Fans love the experience.',
	},
	{
		artist: 'Bass Rebellion',
		genre: 'Electronic',
		achievement: 'Built email list of 15K fans',
		timeframe: '4 months',
		metric: '15K',
		metricLabel: 'Subscribers',
		quote: 'Smart links + email automation = the perfect fan acquisition machine.',
	},
];

const features = [
	{
		icon: <ChartBarIcon className='h-5 w-5' />,
		title: 'Higher Conversion Rates',
		description: 'Artists see 3x better conversion vs. traditional tools',
	},
	{
		icon: <CurrencyDollarIcon className='h-5 w-5' />,
		title: 'Cost Savings',
		description: 'Save $200+ monthly vs. using separate platforms',
	},
	{
		icon: <StarIcon className='h-5 w-5' />,
		title: 'Better Fan Experience',
		description: 'Integrated tools create seamless fan journeys',
	},
];

export function SocialProof() {
	return (
		<div className='bg-background py-24'>
			{/* Stats Section */}
			<Container>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
						Trusted by the Music Community
					</h2>
					<p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
						Join thousands of artists who've transformed their music marketing with
						barely.io
					</p>
				</AnimatedSection>

				<div className='mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
					{stats.map((stat, index) => (
						<AnimatedSection key={stat.label} animation='fade-up' delay={index * 100}>
							<div className='glass rounded-2xl border border-white/10 p-6 text-center'>
								<div className='mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
									{stat.icon}
								</div>
								<div className='mb-2 text-3xl font-bold text-white'>
									{stat.prefix}
									<AnimatedNumber start={0} end={stat.value} />
									{stat.suffix}
								</div>
								<div className='mb-1 text-lg font-semibold text-white'>{stat.label}</div>
								<div className='text-sm text-muted-foreground'>{stat.description}</div>
							</div>
						</AnimatedSection>
					))}
				</div>

				{/* Success Stories */}
				<AnimatedSection animation='fade-up' className='mb-16'>
					<h3 className='mb-12 text-center text-2xl font-bold text-white md:text-3xl'>
						Real Artist Success Stories
					</h3>

					<div className='grid gap-8 lg:grid-cols-3'>
						{successStories.map((story, index) => (
							<AnimatedSection key={story.artist} animation='fade-up' delay={index * 100}>
								<div className='glass h-full rounded-2xl border border-white/10 p-8'>
									<div className='mb-4 flex items-start justify-between'>
										<div>
											<h4 className='text-xl font-bold text-white'>{story.artist}</h4>
											<p className='text-sm text-primary'>{story.genre}</p>
										</div>
										<div className='text-right'>
											<div className='text-2xl font-bold text-secondary'>
												{story.metric}
											</div>
											<div className='text-xs text-muted-foreground'>
												{story.metricLabel}
											</div>
										</div>
									</div>

									<div className='mb-4'>
										<p className='mb-1 font-medium text-white'>{story.achievement}</p>
										<p className='text-sm text-muted-foreground'>in {story.timeframe}</p>
									</div>

									<blockquote className='text-sm italic text-muted-foreground'>
										"{story.quote}"
									</blockquote>
								</div>
							</AnimatedSection>
						))}
					</div>
				</AnimatedSection>

				{/* Key Benefits */}
				<AnimatedSection animation='fade-up'>
					<div className='glass rounded-3xl border border-white/10 p-8'>
						<h3 className='mb-8 text-center text-2xl font-bold text-white'>
							Why Artists Choose barely.io
						</h3>

						<div className='mb-8 grid gap-8 md:grid-cols-3'>
							{features.map(feature => (
								<div key={feature.title} className='flex items-start gap-4'>
									<div className='inline-flex rounded-lg bg-primary/10 p-2 text-primary'>
										{feature.icon}
									</div>
									<div>
										<h4 className='mb-2 font-semibold text-white'>{feature.title}</h4>
										<p className='text-sm text-muted-foreground'>{feature.description}</p>
									</div>
								</div>
							))}
						</div>

						<div className='border-t border-white/10 pt-8 text-center'>
							<p className='mb-6 text-muted-foreground'>
								Ready to join the community of successful artists?
							</p>
							<div className='flex flex-col justify-center gap-4 sm:flex-row'>
								<MarketingButton variant='hero-primary' href='/pricing' glow>
									Start Free Today
								</MarketingButton>
								<MarketingButton variant='hero-secondary' href='/features'>
									Explore Features
								</MarketingButton>
							</div>
						</div>
					</div>
				</AnimatedSection>
			</Container>
		</div>
	);
}
