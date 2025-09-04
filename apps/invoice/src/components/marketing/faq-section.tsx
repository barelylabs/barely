'use client';

import { useState } from 'react';
import { cn } from '@barely/utils';
import { ChevronDown } from 'lucide-react';

import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

interface FAQItem {
	question: string;
	answer: string;
}

const faqs: FAQItem[] = [
	{
		question: 'Do I need a Stripe account?',
		answer:
			'Yes, we use Stripe Connect for payments. It takes 5 minutes to set up and means your money goes directly to you, not through us.',
	},
	{
		question: 'Can I import clients from QuickBooks?',
		answer: "Not yet. We're keeping things simple. Copy-paste works great for now.",
	},
	{
		question: 'What about taxes and accounting?',
		answer:
			"We're invoicing software, not accounting software. Export your data to CSV for your accountant.",
	},
	{
		question: 'Can clients pay without creating an account?',
		answer: 'Yes! They just click "Pay Now" and enter their card. No friction.',
	},
	{
		question: 'Is there a mobile app?',
		answer: 'The web app works perfectly on mobile. Native apps are on the roadmap.',
	},
	{
		question: 'What if I need more than invoicing?',
		answer:
			"Check out our other Barely tools, or stick with us - we're launching expenses next.",
	},
];

function FAQCard({ faq }: { faq: FAQItem }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div
			className='cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50'
			onClick={() => setIsOpen(!isOpen)}
		>
			<div className='flex items-start justify-between gap-4'>
				<div className='flex-1'>
					<Text variant='sm/semibold' className='mb-2'>
						{faq.question}
					</Text>
					{isOpen && (
						<Text variant='sm/normal' className='text-muted-foreground'>
							{faq.answer}
						</Text>
					)}
				</div>
				<ChevronDown
					className={cn(
						'h-5 w-5 text-muted-foreground transition-transform',
						isOpen && 'rotate-180',
					)}
				/>
			</div>
		</div>
	);
}

export function FAQSection() {
	return (
		<section className='bg-muted/30 py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Questions? We've Barely Got Answers
					</H>
				</AnimatedSection>

				<div className='mx-auto max-w-3xl'>
					<div className='grid gap-4'>
						{faqs.map((faq, index) => (
							<AnimatedSection key={faq.question} animation='fade-up' delay={50 * index}>
								<FAQCard faq={faq} />
							</AnimatedSection>
						))}
					</div>
				</div>
			</Container>
		</section>
	);
}
