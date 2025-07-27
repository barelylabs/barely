'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

import { AnimatedSection } from './animated-section';

const faqs = [
	{
		question: 'What happens to my data if I decide to leave?',
		answer:
			'Your data is always yours. You can export all your data, including fan lists, analytics, and content at any time. We provide standard formats (CSV, JSON) that work with other platforms. No lock-in, ever.',
	},
	{
		question: 'How much does barely.ai cost?',
		answer:
			'We offer a generous free tier for bedroom producers just starting out. Paid plans start at $19/month and scale with your career. Check our pricing page for detailed breakdowns and ROI calculations.',
	},
	{
		question: 'Can I migrate from my existing tools?',
		answer:
			'Yes! We have import tools for popular platforms like Linkfire, ConvertKit, and Mailchimp. Our support team can also help with custom migrations to ensure a smooth transition.',
	},
	{
		question: 'What kind of support do you offer?',
		answer:
			'Free tier users get community support and comprehensive documentation. Paid plans include priority email support, with response times under 24 hours. Enterprise plans get dedicated support channels.',
	},
	{
		question: 'Is barely.ai right for labels or just individual artists?',
		answer:
			'Both! Our platform scales from bedroom producers to full labels. The Label tier includes team management, multi-artist analytics, and white-label options for agencies.',
	},
	{
		question: 'How is this different from using multiple specialized tools?',
		answer:
			"Integration is everything. When your smart links talk to your email list, and your merch store feeds your analytics, you get insights and automation that separate tools can't provide. Plus, it's more affordable.",
	},
	{
		question: 'When will the AI features mentioned in pricing be available?',
		answer:
			"We're actively developing AI-powered features for content creation and campaign optimization. Early access users will be the first to test these features when they launch in Q2 2025.",
	},
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='border-b border-gray-800'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex w-full items-center justify-between py-6 text-left'
			>
				<span className='text-lg font-medium text-white'>{question}</span>
				<ChevronDownIcon
					className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className='overflow-hidden'
					>
						<p className='pb-6 text-gray-400'>{answer}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function FAQSection() {
	return (
		<section className='bg-background py-24'>
			<div className='mx-auto max-w-3xl px-6 lg:px-8'>
				<AnimatedSection animation='fade-up'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
							Frequently Asked Questions
						</h2>
						<p className='mt-4 text-lg text-gray-400'>
							Everything you need to know about barely.ai
						</p>
					</div>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={100}>
					<div className='mt-12'>
						{faqs.map((faq, index) => (
							<FAQItem key={index} {...faq} />
						))}
					</div>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={200}>
					<div className='mt-12 text-center'>
						<p className='text-gray-400'>
							Still have questions?{' '}
							<a
								href='mailto:hello@barely.ai'
								className='font-medium text-white underline hover:text-gray-300'
							>
								Contact our team
							</a>
						</p>
					</div>
				</AnimatedSection>
			</div>
		</section>
	);
}
