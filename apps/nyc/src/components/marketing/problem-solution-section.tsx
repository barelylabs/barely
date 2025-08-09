'use client';

import { cn } from '@barely/utils';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from './animated-section';

const problems = [
	'Expensive services that drain your budget with minimal results',
	"Risky playlist schemes that violate Spotify's terms",
	'Black-box agencies that hide how they actually work',
];

const solutions = [
	'Data-driven campaigns with transparent reporting',
	'Open-source tools you can see and understand',
	'Strategies that follow platform guidelines and build real audiences',
];

export function ProblemSolutionSection() {
	return (
		<section className='px-4 py-24 sm:px-6 lg:px-8'>
			<div className='mx-auto max-w-7xl'>
				<AnimatedSection animation='fade-up'>
					<H size='2' className='mb-16 text-center text-4xl md:text-5xl'>
						<span className='text-white/70'>
							If you&apos;ve been burned by music marketing before,
						</span>
						<br />
						<span className='text-white'>you&apos;re not alone.</span>
					</H>
				</AnimatedSection>

				<div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16'>
					{/* Problems */}
					<AnimatedSection animation='slide-right' delay={200}>
						<div className='space-y-6'>
							<h3 className='mb-8 text-2xl font-semibold text-white'>
								Most indie artists waste money on:
							</h3>
							{problems.map((problem, index) => (
								<div
									key={index}
									className={cn(
										'flex items-start gap-4 rounded-xl p-6',
										'border border-red-500/20 bg-red-500/5',
										'transform transition-all duration-300 hover:scale-105',
									)}
									style={{
										animationDelay: `${300 + index * 100}ms`,
									}}
								>
									<span className='text-2xl text-red-500'>❌</span>
									<p className='text-white/80'>{problem}</p>
								</div>
							))}
						</div>
					</AnimatedSection>

					{/* Solutions */}
					<AnimatedSection animation='slide-left' delay={400}>
						<div className='space-y-6'>
							<h3 className='mb-8 text-2xl font-semibold text-white'>
								Here&apos;s what actually works:
							</h3>
							{solutions.map((solution, index) => (
								<div
									key={index}
									className={cn(
										'flex items-start gap-4 rounded-xl p-6',
										'border border-green-500/20 bg-green-500/5',
										'transform transition-all duration-300 hover:scale-105',
										'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
									)}
									style={{
										animationDelay: `${500 + index * 100}ms`,
									}}
								>
									<span className='text-2xl text-green-500'>✅</span>
									<p className='text-white/80'>{solution}</p>
								</div>
							))}
						</div>
					</AnimatedSection>
				</div>
			</div>
		</section>
	);
}
