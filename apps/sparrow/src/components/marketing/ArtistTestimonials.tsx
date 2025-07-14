'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@barely/utils';

import { Img } from '@barely/ui/img';
import { H } from '@barely/ui/typography';

import { allCaseStudies } from '../../data/case-studies';
import { AnimatedSection } from './AnimatedSection';
import { MarketingButton } from './Button';

// Extract testimonials from case studies
const testimonials = allCaseStudies.map(study => ({
	id: study.id,
	quote: study.testimonial.quote,
	artistName: study.artistName,
	genre: study.genre,
	metric:
		study.metrics.after.monthlyListeners > 10000 ?
			`${(study.metrics.after.monthlyListeners / 1000).toFixed(0)}k monthly listeners`
		: study.merchRevenue ? `$${study.merchRevenue.after.toLocaleString()}/mo merch`
		: `+${Math.round(((study.metrics.after.monthlyListeners - study.metrics.before.monthlyListeners) / study.metrics.before.monthlyListeners) * 100)}% growth`,
	avatarUrl: study.avatarUrl,
}));

export function ArtistTestimonials() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentIndex(prev => (prev + 1) % testimonials.length);
				setIsAnimating(false);
			}, 300);
		}, 5000); // Change every 5 seconds

		return () => clearInterval(interval);
	}, []);

	const current = testimonials[currentIndex];

	if (!current || testimonials.length === 0) {
		return null;
	}

	return (
		<section className='relative overflow-hidden py-24'>
			{/* Background Pattern */}
			<div className='absolute inset-0 opacity-5'>
				<div
					className='absolute inset-0'
					style={{
						backgroundImage: `radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)`,
					}}
				/>
			</div>

			<div className='relative px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-16 text-center text-4xl md:text-5xl'>
							Real Artists. <span className='gradient-text'>Real Results.</span>
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<div className='relative'>
							{/* Large Testimonial Display */}
							<Link href={`/case-studies/${current.id}`}>
								<div className='group relative'>
									{/* Background gradient that moves on hover */}
									<div className='absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-25 blur transition duration-1000 group-hover:opacity-75 group-hover:duration-200' />

									<div className='relative rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl transition-all duration-300 group-hover:border-white/20 md:p-12'>
										<div
											className={cn(
												'transition-all duration-500',
												isAnimating && 'translate-y-4 opacity-0',
											)}
										>
											{/* Large Quote Mark */}
											<div className='mb-4 font-serif text-6xl leading-none text-purple-500/20'>
												&ldquo;
											</div>

											{/* Quote */}
											<blockquote className='mb-12 text-2xl font-light leading-relaxed text-white/90 md:text-3xl lg:text-4xl'>
												{current.quote}
											</blockquote>

											{/* Artist Info with Metric */}
											<div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
												<div className='flex items-center gap-4'>
													{current.avatarUrl && (
														<div className='relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/20'>
															<Img
																src={current.avatarUrl}
																alt={current.artistName}
																width={64}
																height={64}
																className='h-full w-full object-cover'
															/>
														</div>
													)}
													<div>
														<div className='text-xl font-semibold text-white'>
															{current.artistName}
														</div>
														<div className='text-white/60'>{current.genre}</div>
													</div>
												</div>
												<div className='flex items-center gap-6'>
													<div className='text-3xl font-bold text-green-500'>
														{current.metric}
													</div>
													<div className='flex items-center gap-2 text-purple-300 transition-colors group-hover:text-purple-200'>
														<span>Read Story</span>
														<svg
															className='h-5 w-5 transition-transform group-hover:translate-x-1'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M9 5l7 7-7 7'
															/>
														</svg>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Link>

							{/* Progress Indicators */}
							<div className='mt-12 flex justify-center gap-3'>
								{testimonials.map((_, index) => (
									<button
										key={index}
										onClick={() => {
											setIsAnimating(true);
											setTimeout(() => {
												setCurrentIndex(index);
												setIsAnimating(false);
											}, 300);
										}}
										className={cn(
											'h-1 rounded-full transition-all duration-500',
											index === currentIndex ?
												'w-12 bg-gradient-to-r from-purple-500 to-pink-500'
											:	'w-6 bg-white/20 hover:bg-white/30',
										)}
										aria-label={`Go to testimonial ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</AnimatedSection>

					{/* CTA */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mt-16 text-center'>
							<p className='mb-6 text-white/60'>
								Join hundreds of artists building sustainable careers
							</p>
							<Link href='/case-studies'>
								<MarketingButton marketingLook='hero-secondary' size='lg'>
									View All Success Stories
								</MarketingButton>
							</Link>
						</div>
					</AnimatedSection>
				</div>
			</div>
		</section>
	);
}
