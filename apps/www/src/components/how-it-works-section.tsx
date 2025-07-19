'use client';

import { useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';
import { Plug, TrendingUp, UserPlus } from 'lucide-react';

import { AnimatedSection } from './animated-section';
import { ContactModal } from './contact-modal';
import { Container } from './container';
import { Heading, Subheading } from './text';

const steps = [
	{
		number: '01',
		icon: <UserPlus className='h-8 w-8' />,
		title: 'Sign up in seconds',
		description:
			'Create your free account with just an email. No credit card required to explore all features.',
	},
	{
		number: '02',
		icon: <Plug className='h-8 w-8' />,
		title: 'Connect your music',
		description:
			'Import your releases, fan lists, and existing tools. We make migration easy with step-by-step guides.',
	},
	{
		number: '03',
		icon: <TrendingUp className='h-8 w-8' />,
		title: 'Grow your audience',
		description:
			'Launch campaigns, track results, and watch your fanbase expand with integrated marketing tools.',
	},
];

export function HowItWorksSection() {
	const [showContactModal, setShowContactModal] = useState(false);

	return (
		<section className='bg-card py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='text-center'>
					<Subheading>Get Started</Subheading>
					<Heading as='h2' className='mt-2 text-white'>
						How It Works
					</Heading>
					<p className='mx-auto mt-6 max-w-2xl text-lg text-muted-foreground'>
						Go from zero to professional music marketing in minutes, not months
					</p>
				</AnimatedSection>

				<div className='mt-16 grid gap-8 md:grid-cols-3'>
					{steps.map((step, index) => (
						<AnimatedSection key={index} animation='fade-up' delay={100 + index * 100}>
							<div className='relative'>
								<div className='group relative text-center'>
									{/* Step number with underline */}
									<div className='mb-6 inline-block text-left'>
										<div className='text-5xl font-bold text-primary/40'>
											{step.number}
										</div>
										<div className='mt-2 h-0.5 w-full bg-gradient-to-r from-primary/60 to-primary/20' />
									</div>

									{/* Icon container */}
									<div className='mb-6 flex justify-center'>
										<div className='inline-flex rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4 ring-1 ring-white/10 transition-all group-hover:from-primary/20 group-hover:to-secondary/20'>
											<div className='text-white'>{step.icon}</div>
										</div>
									</div>

									{/* Content */}
									<h3 className='mb-3 text-left text-xl font-semibold text-white'>
										{step.title}
									</h3>
									<p className='text-left text-gray-400'>{step.description}</p>
								</div>
							</div>
						</AnimatedSection>
					))}
				</div>

				<AnimatedSection animation='fade-up' delay={400} className='mt-16 text-center'>
					<p className='text-lg text-muted-foreground'>
						Ready to transform your music marketing?
					</p>
					<div className='mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center'>
						<a
							href={getAbsoluteUrl('app', 'register?ref=www/how-it-works')}
							className='inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90'
						>
							Start Free Trial
						</a>
						<button
							onClick={() => setShowContactModal(true)}
							className='inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10'
						>
							Book a Demo
						</button>
					</div>
				</AnimatedSection>
			</Container>

			{/* Contact Modal */}
			<ContactModal
				show={showContactModal}
				onClose={() => setShowContactModal(false)}
				variant='demo'
			/>
		</section>
	);
}
