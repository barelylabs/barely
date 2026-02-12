import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@barely/ui/icon';
import { Img } from '@barely/ui/img';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '~/components/marketing/animated-section';
import { MarketingButton } from '~/components/marketing/button';
import { CalComLink } from '~/components/marketing/cal-com-link';
import { CaseStudyMetrics } from '~/components/marketing/case-study-metrics';
import { CaseStudyTimeline } from '~/components/marketing/case-study-timeline';

import { getAllCaseStudyIds, getCaseStudyById } from '~/data/case-studies';

export function generateStaticParams() {
	return getAllCaseStudyIds().map(id => ({
		slug: id,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const study = getCaseStudyById(slug);

	if (!study) {
		return {
			title: 'Case Study Not Found',
		};
	}

	return {
		title: `${study.artistName} Case Study - ${study.metrics.before.monthlyListeners} to ${study.metrics.after.monthlyListeners} Monthly Listeners | Barely`,
		description: `See how ${study.artistName} grew from ${study.metrics.before.monthlyListeners} to ${study.metrics.after.monthlyListeners} monthly listeners in ${study.timeline.length} months with ${study.serviceTier}.`,
	};
}

export default async function CaseStudyPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const study = getCaseStudyById(slug);

	if (!study) {
		notFound();
	}

	return (
		<main className='pt-16'>
			{/* Hero Section */}
			<section className='px-4 py-16 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<Link
							href='/case-studies'
							className='mb-12 inline-flex items-center text-purple-300 hover:text-purple-300'
						>
							<svg
								className='mr-2 h-4 w-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
							Back to Case Studies
						</Link>

						{/* Spotify-style layout with large avatar and stacked info */}
						<div className='flex flex-col items-start gap-6 md:flex-row md:items-end md:gap-8'>
							{/* Large Avatar */}
							<div className='relative mx-auto h-40 w-40 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 md:mx-0 md:h-56 md:w-56'>
								{study.avatarUrl ?
									<Img
										src={study.avatarUrl}
										alt={study.artistName}
										width={224}
										height={224}
										className='h-full w-full object-cover'
									/>
								:	<div className='flex h-full w-full items-center justify-center text-6xl font-bold text-white/60 md:text-8xl'>
										{study.artistName.charAt(0).toUpperCase()}
									</div>
								}
							</div>

							{/* Stacked Info */}
							<div className='flex-1 text-center md:text-left'>
								<p className='mb-2 text-sm uppercase tracking-wide text-white/60'>
									Case Study
								</p>
								<H
									size='1'
									className='mb-4 font-heading text-4xl md:text-6xl lg:text-7xl'
								>
									{study.artistName}
								</H>
								<div className='mb-2 flex items-center justify-center gap-3 text-lg text-white/80 md:justify-start md:text-xl'>
									<span>
										{study.genre} • {study.serviceTier}
									</span>

									{/* Social Links */}
									{study.socials && (
										<>
											<span className='text-white/80'>•</span>
											<div className='flex items-center gap-3'>
												{study.socials.spotify && (
													<a
														href={study.socials.spotify}
														target='_blank'
														rel='noopener noreferrer'
														className='text-white/60 transition-colors hover:text-green-500'
														aria-label='Spotify'
													>
														<Icon.spotify className='h-4 w-4' />
													</a>
												)}
												{study.socials.instagram && (
													<a
														href={study.socials.instagram}
														target='_blank'
														rel='noopener noreferrer'
														className='text-white/60 transition-colors hover:text-pink-500'
														aria-label='Instagram'
													>
														<Icon.instagram className='h-4 w-4' />
													</a>
												)}
												{study.socials.tiktok && (
													<a
														href={study.socials.tiktok}
														target='_blank'
														rel='noopener noreferrer'
														className='text-white/60 transition-colors hover:text-white'
														aria-label='TikTok'
													>
														<Icon.tiktok className='h-4 w-4' />
													</a>
												)}
												{study.socials.youtube && (
													<a
														href={study.socials.youtube}
														target='_blank'
														rel='noopener noreferrer'
														className='text-white/60 transition-colors hover:text-red-500'
														aria-label='YouTube'
													>
														<Icon.youtube className='h-4 w-4' />
													</a>
												)}
												{study.socials.patreon && (
													<a
														href={study.socials.patreon}
														target='_blank'
														rel='noopener noreferrer'
														className='text-white/60 transition-colors hover:text-orange-500'
														aria-label='Patreon'
													>
														<Icon.heart className='h-4 w-4' />
													</a>
												)}
											</div>
										</>
									)}
								</div>
								<p className='text-2xl text-white md:text-3xl'>
									<span className='text-white/60'>
										{study.metrics.before.monthlyListeners.toLocaleString()}
									</span>
									<span className='mx-3 font-bold text-green-500'>→</span>
									<span className='font-bold text-green-500'>
										{study.metrics.after.monthlyListeners.toLocaleString()}
									</span>
									<span className='ml-2 text-lg text-white/60 md:text-xl'>
										monthly listeners
									</span>
								</p>
								<p className='mt-2 text-white/60'>
									{study.startDate} - {study.endDate}
								</p>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* Metrics Dashboard */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-6xl'>
					<AnimatedSection animation='fade-up'>
						<CaseStudyMetrics before={study.metrics.before} after={study.metrics.after} />
					</AnimatedSection>
				</div>
			</section>

			{/* Challenge Section */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-6 text-3xl'>
							The Challenge
						</H>
						<p className='text-lg leading-relaxed text-white/80'>{study.challenge}</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Strategy Section */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-8 text-3xl'>
							The Strategy
						</H>
					</AnimatedSection>

					<div className='space-y-6'>
						{study.strategy.map((item, index) => (
							<AnimatedSection
								key={index}
								animation='slide-right'
								delay={200 + index * 100}
							>
								<div className='glass rounded-xl p-6'>
									<H size='5' className='mb-3 text-purple-300'>
										{item.title}
									</H>
									<p className='text-white/70'>{item.description}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Timeline */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-8 text-3xl'>
							Campaign Timeline
						</H>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<CaseStudyTimeline timeline={study.timeline} />
					</AnimatedSection>
				</div>
			</section>

			{/* Investment & Return */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-8 text-3xl'>
							Investment & Return
						</H>
					</AnimatedSection>

					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						<AnimatedSection animation='scale' delay={200}>
							<div className='glass rounded-xl p-6 text-center'>
								<p className='mb-2 text-white/60'>Service Fee</p>
								<p className='text-2xl font-bold text-white'>
									{study.investment.serviceFee}
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='scale' delay={300}>
							<div className='glass rounded-xl p-6 text-center'>
								<p className='mb-2 text-white/60'>Ad Spend</p>
								<p className='text-2xl font-bold text-white'>
									{study.investment.adSpend}
								</p>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='scale' delay={400}>
							<div className='glass rounded-xl border border-purple-500/30 p-6 text-center'>
								<p className='mb-2 text-white/60'>Total Investment</p>
								<p className='text-2xl font-bold text-purple-300'>
									{study.investment.total}
								</p>
							</div>
						</AnimatedSection>
					</div>
				</div>
			</section>

			{/* Key Results */}
			<section className='bg-white/5 px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='fade-up'>
						<H size='3' className='mb-8 text-3xl'>
							Key Results
						</H>
					</AnimatedSection>

					<div className='space-y-4'>
						{study.keyResults.map((result, index) => (
							<AnimatedSection
								key={index}
								animation='slide-right'
								delay={200 + index * 100}
							>
								<div className='glass flex items-start gap-4 rounded-xl p-4'>
									<span className='mt-0.5 text-xl text-green-500'>✓</span>
									<p className='text-white/80'>{result}</p>
								</div>
							</AnimatedSection>
						))}
					</div>
				</div>
			</section>

			{/* Testimonial */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl'>
					<AnimatedSection animation='scale'>
						<div className='glass rounded-2xl border border-purple-500/30 p-8 text-center'>
							<svg
								className='mx-auto mb-6 h-12 w-12 text-purple-300'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z' />
							</svg>
							<p className='mb-6 text-xl italic leading-relaxed text-white/90'>
								&quot;{study.testimonial.quote}&quot;
							</p>
							<p className='text-white/60'>— {study.testimonial.author}</p>
						</div>
					</AnimatedSection>
				</div>
			</section>

			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='2' className='mb-6 text-4xl md:text-5xl'>
							Ready to Write Your Success Story?
						</H>
						<p className='mb-4 text-xl text-white/70'>
							Every artist&apos;s journey is unique. Let&apos;s design a strategy that
							works for your music.
						</p>
						<p className='mb-12 text-base text-white/60'>
							See results like this? Book a free 30-minute strategy call and get your
							custom growth plan.
						</p>
					</AnimatedSection>

					<AnimatedSection animation='scale' delay={200}>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<Link href='/services'>
								<MarketingButton marketingLook='hero-primary' size='lg'>
									View Services
								</MarketingButton>
							</Link>
							<CalComLink>
								<MarketingButton marketingLook='hero-secondary' size='lg'>
									Book Free Strategy Call
								</MarketingButton>
							</CalComLink>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
