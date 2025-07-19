import { AnimatedSection } from './animated-section';

const problems = [
	'Expensive tool stacks with fragmented data across 6+ platforms',
	"Generic business tools that don't understand music careers",
	'All-in-one platforms that sacrifice quality for convenience',
	'Black-box services where you never know how things actually work',
];

const solutions = [
	'Professional-grade tools designed specifically for musicians',
	'Complete integration showing real ROI on every campaign',
	'Open-source transparency so you understand exactly how everything works',
	'A platform that scales from bedroom to label-level operations',
];

export function ProblemSolutionSection() {
	return (
		<section className='relative py-24'>
			<div className='mx-auto max-w-7xl px-6 lg:px-8'>
				<AnimatedSection animation='fade-up' className='mb-16 text-center'>
					<h2 className='mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
						Ready to build your musical empire with tools that{' '}
						<span className='gradient-text'>actually work together?</span>
					</h2>
				</AnimatedSection>

				<div className='grid gap-12 lg:grid-cols-2 lg:gap-8'>
					{/* Problems */}
					<AnimatedSection animation='slide-right' delay={100}>
						<div className='rounded-2xl border border-destructive/20 bg-destructive/5 p-8'>
							<h3 className='mb-6 text-xl font-semibold text-destructive'>
								Most platforms force you to choose between:
							</h3>
							<ul className='space-y-4'>
								{problems.map((problem, index) => (
									<li
										key={index}
										className='flex items-start gap-3 text-muted-foreground'
									>
										<span className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs text-destructive'>
											✕
										</span>
										<span>{problem}</span>
									</li>
								))}
							</ul>
						</div>
					</AnimatedSection>

					{/* Solutions */}
					<AnimatedSection animation='slide-left' delay={200}>
						<div className='rounded-2xl border border-success/20 bg-success/5 p-8'>
							<h3 className='mb-6 text-xl font-semibold text-success'>
								Here's what you actually deserve:
							</h3>
							<ul className='space-y-4'>
								{solutions.map((solution, index) => (
									<li key={index} className='flex items-start gap-3 text-white'>
										<span className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs text-success'>
											✓
										</span>
										<span>{solution}</span>
									</li>
								))}
							</ul>
						</div>
					</AnimatedSection>
				</div>
			</div>
		</section>
	);
}
