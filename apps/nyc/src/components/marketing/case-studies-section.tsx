'use client';

import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from './animated-section';
import { CaseStudyCard } from './case-study-card';

interface CaseStudy {
	slug: string;
	artistName: string;
	genre: string;
	serviceTier: string;
	beforeListeners: number;
	afterListeners: number;
	growthPercentage: number;
	timeframe: string;
	avatarUrl?: string;
	merchRevenue?: {
		before: number;
		after: number;
	};
	summary: string;
	featured?: boolean;
}

interface CaseStudiesSectionProps {
	title?: string;
	subtitle?: string;
	caseStudies: CaseStudy[];
	variant?: 'default' | 'compact';
	showLinks?: boolean;
}

export function CaseStudiesSection({
	title = 'How Artists Grow With Barely NYC',
	subtitle = 'Real results from indie artists who partnered with us',
	caseStudies,
	variant = 'default',
	showLinks = true,
}: CaseStudiesSectionProps) {
	const sectionClasses =
		variant === 'compact' ? 'px-4 py-16 sm:px-6 lg:px-8' : 'px-4 py-16 sm:px-6 lg:px-8';
	const containerClasses =
		variant === 'compact' ? 'mx-auto max-w-4xl' : 'mx-auto max-w-7xl';

	return (
		<section className={`bg-white/5 ${sectionClasses}`}>
			<div className={containerClasses}>
				<AnimatedSection animation='fade-up'>
					<div className='mb-12 text-center'>
						<H size='2' className='mb-4 text-3xl md:text-4xl'>
							{title}
						</H>
						<p className='text-lg text-white/70'>{subtitle}</p>
					</div>
				</AnimatedSection>

				<div
					className={`grid gap-8 ${variant === 'compact' ? 'md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}
				>
					{caseStudies.map((study, index) => (
						<AnimatedSection
							key={study.slug}
							animation='fade-up'
							delay={200 + index * 100}
						>
							{showLinks ?
								<Link href={`/case-studies/${study.slug}`}>
									<CaseStudyCard {...study} />
								</Link>
							:	<CaseStudyCard {...study} />}
						</AnimatedSection>
					))}
				</div>
			</div>
		</section>
	);
}
