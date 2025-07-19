'use client';

import { useState } from 'react';
import { cn } from '@barely/utils';
import {
	GlobeAltIcon,
	HomeIcon,
	MicrophoneIcon,
	MusicalNoteIcon,
} from '@heroicons/react/24/outline';

import { AnimatedSection } from './animated-section';
import { MarketingButton } from './marketing-button';

interface CareerStage {
	id: string;
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	description: string;
	challenges: string[];
	barelyFeatures: string[];
	successMetrics: string[];
	plan: string;
	planPrice: string;
}

const careerStages: CareerStage[] = [
	{
		id: 'bedroom',
		title: 'Bedroom Producer',
		subtitle: 'Just Starting Out',
		icon: <HomeIcon className='h-8 w-8' />,
		description:
			"You're creating music in your bedroom, uploading to streaming platforms, and trying to build your first fanbase.",
		challenges: [
			'Limited budget for marketing tools',
			'No idea where to start with promotion',
			'Scattered fans across different platforms',
		],
		barelyFeatures: [
			'Free smart links for all releases',
			'Basic email collection & automation',
			'Simple landing pages for releases',
			'Social media integration',
		],
		successMetrics: [
			'First 1,000 streams',
			'100 email subscribers',
			'Active social media presence',
		],
		plan: 'Free',
		planPrice: '$0/month',
	},
	{
		id: 'rising',
		title: 'Rising Artist',
		subtitle: 'Building Momentum',
		icon: <MusicalNoteIcon className='h-8 w-8' />,
		description:
			"You have a growing fanbase, regular releases, and you're starting to make money from your music.",
		challenges: [
			'Need better fan engagement tools',
			'Want to sell merch effectively',
			'Tracking growth across platforms is messy',
		],
		barelyFeatures: [
			'Advanced email campaigns & automation',
			'Professional landing pages',
			'Merch store with fan data integration',
			'Detailed analytics dashboard',
		],
		successMetrics: [
			'10,000+ monthly listeners',
			'1,000+ email subscribers',
			'Regular merch sales',
		],
		plan: 'Rising',
		planPrice: '$35/month',
	},
	{
		id: 'breakout',
		title: 'Breakout Act',
		subtitle: 'Making Waves',
		icon: <MicrophoneIcon className='h-8 w-8' />,
		description:
			"You're gaining serious traction, booking shows regularly, and music is becoming your primary income.",
		challenges: [
			'Managing complex release campaigns',
			'Coordinating team communications',
			'Maximizing revenue from each release',
		],
		barelyFeatures: [
			'Advanced automation workflows',
			'Team collaboration tools',
			'VIP fan tiers & exclusive content',
			'Advanced analytics & insights',
		],
		successMetrics: [
			'100,000+ monthly listeners',
			'5,000+ email subscribers',
			'Sold-out local shows',
		],
		plan: 'Breakout',
		planPrice: '$75/month',
	},
	{
		id: 'touring',
		title: 'Touring Artist',
		subtitle: 'Professional Level',
		icon: <GlobeAltIcon className='h-8 w-8' />,
		description:
			"You're touring nationally/internationally, have a team, and music is your full-time career.",
		challenges: [
			'Managing fan relationships across regions',
			'Coordinating complex marketing campaigns',
			'Maximizing efficiency with limited time',
		],
		barelyFeatures: [
			'Multi-region campaign management',
			'Advanced team permissions',
			'Custom integrations & API access',
			'Priority support & strategy calls',
		],
		successMetrics: [
			'500,000+ monthly listeners',
			'25,000+ email subscribers',
			'International touring',
		],
		plan: 'Label',
		planPrice: '$150/month',
	},
];

export function CareerProgression() {
	const [activeStage, setActiveStage] = useState(0);

	return (
		<div className='py-24'>
			<div className='mb-16 text-center'>
				<AnimatedSection animation='fade-up'>
					<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
						Your Career Journey with{' '}
						<span className='bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent'>
							barely.io
						</span>
					</h2>
					<p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
						From bedroom producer to touring artist, barely.io scales with your career.
						See how each stage unlocks new possibilities.
					</p>
				</AnimatedSection>
			</div>

			{/* Stage Navigation */}
			<div className='mb-12 flex flex-wrap justify-center gap-4'>
				{careerStages.map((stage, index) => (
					<button
						key={stage.id}
						onClick={() => setActiveStage(index)}
						className={cn(
							'flex items-center gap-3 rounded-xl border px-6 py-3 transition-all duration-300',
							activeStage === index ?
								'border-primary bg-primary/10 text-primary'
							:	'border-white/10 text-muted-foreground hover:border-white/20 hover:text-white',
						)}
					>
						<div
							className={cn(
								'transition-colors duration-300',
								activeStage === index ? 'text-primary' : 'text-muted-foreground',
							)}
						>
							{stage.icon}
						</div>
						<div className='text-left'>
							<div className='font-medium'>{stage.title}</div>
							<div className='text-xs opacity-75'>{stage.subtitle}</div>
						</div>
					</button>
				))}
			</div>

			{/* Active Stage Content */}
			<AnimatedSection key={activeStage} animation='fade-up'>
				<div className='glass rounded-3xl border border-white/10 p-8'>
					<div className='grid gap-12 lg:grid-cols-2'>
						{/* Stage Info */}
						<div>
							<div className='mb-6 flex items-center gap-4'>
								<div className='inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
									{careerStages[activeStage]?.icon}
								</div>
								<div>
									<h3 className='text-2xl font-bold text-white'>
										{careerStages[activeStage]?.title}
									</h3>
									<p className='text-muted-foreground'>
										{careerStages[activeStage]?.subtitle}
									</p>
								</div>
							</div>

							<p className='mb-6 text-muted-foreground'>
								{careerStages[activeStage]?.description}
							</p>

							{/* Challenges */}
							<div className='mb-6'>
								<h4 className='mb-3 text-lg font-semibold text-white'>
									Common Challenges at This Stage
								</h4>
								<ul className='space-y-2'>
									{careerStages[activeStage]?.challenges.map((challenge, index) => (
										<li key={index} className='flex items-start gap-3'>
											<div className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500' />
											<span className='text-muted-foreground'>{challenge}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Success Metrics */}
							<div>
								<h4 className='mb-3 text-lg font-semibold text-white'>
									Success Metrics to Aim For
								</h4>
								<ul className='space-y-2'>
									{careerStages[activeStage]?.successMetrics.map((metric, index) => (
										<li key={index} className='flex items-start gap-3'>
											<div className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary' />
											<span className='text-muted-foreground'>{metric}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* barely.io Solution */}
						<div>
							<div className='glass mb-6 rounded-xl border border-white/10 p-6'>
								<h4 className='mb-4 text-lg font-semibold text-white'>
									How barely.io Helps You Succeed
								</h4>
								<ul className='space-y-3'>
									{careerStages[activeStage]?.barelyFeatures.map((feature, index) => (
										<li key={index} className='flex items-start gap-3'>
											<div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20'>
												<div className='h-2 w-2 rounded-full bg-primary' />
											</div>
											<span className='text-muted-foreground'>{feature}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Recommended Plan */}
							<div className='glass rounded-xl border border-secondary/20 bg-secondary/5 p-6'>
								<div className='text-center'>
									<h4 className='mb-2 text-lg font-semibold text-white'>
										Recommended Plan
									</h4>
									<div className='mb-2 text-3xl font-bold text-secondary'>
										{careerStages[activeStage]?.plan}
									</div>
									<div className='mb-4 text-muted-foreground'>
										{careerStages[activeStage]?.planPrice}
									</div>
									<MarketingButton
										variant='hero-primary'
										href='/pricing'
										className='w-full'
									>
										Get Started with {careerStages[activeStage]?.plan}
									</MarketingButton>
								</div>
							</div>

							{activeStage < careerStages.length - 1 && (
								<div className='mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4'>
									<p className='text-center text-sm text-muted-foreground'>
										<span className='font-medium text-primary'>Next Stage:</span>{' '}
										{careerStages[activeStage + 1]?.title} - Upgrade seamlessly as you
										grow
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</AnimatedSection>

			{/* Progress Timeline */}
			<div className='mt-16'>
				<AnimatedSection animation='fade-up'>
					<div className='glass rounded-xl border border-white/10 p-6'>
						<h4 className='mb-6 text-center text-lg font-semibold text-white'>
							Your Growth Timeline
						</h4>
						<div className='relative'>
							{/* Progress Line */}
							<div className='absolute left-0 right-0 top-6 h-0.5 bg-white/10'>
								<div
									className='h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500'
									style={{ width: `${((activeStage + 1) / careerStages.length) * 100}%` }}
								/>
							</div>

							{/* Stage Dots */}
							<div className='relative flex justify-between'>
								{careerStages.map((stage, index) => (
									<div key={stage.id} className='flex flex-col items-center'>
										<button
											onClick={() => setActiveStage(index)}
											className={cn(
												'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
												index <= activeStage ?
													'border-primary bg-primary text-white'
												:	'border-white/30 bg-background text-muted-foreground hover:border-white/50',
											)}
										>
											{stage.icon}
										</button>
										<div className='mt-3 max-w-24 text-center'>
											<div
												className={cn(
													'text-sm font-medium transition-colors duration-300',
													index <= activeStage ? 'text-white' : 'text-muted-foreground',
												)}
											>
												{stage.title}
											</div>
											<div className='mt-1 text-xs text-muted-foreground'>
												{stage.planPrice}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</AnimatedSection>
			</div>
		</div>
	);
}
