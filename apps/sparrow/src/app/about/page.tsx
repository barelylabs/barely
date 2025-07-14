import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/AnimatedSection';
import { MarketingButton } from '../../components/marketing/Button';

export const metadata: Metadata = {
	title: 'About - From Lab to Studio | Barely Sparrow',
	description:
		'The PhD who left science to fix music marketing. Building transparent tools so indie artists can focus on what they do best.',
};

export default function AboutPage() {
	return (
		<main className='pt-16'>
			{' '}
			{/* Offset for fixed navigation */}
			{/* Page Header */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							The PhD Who Left Science to Fix Music Marketing
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Building transparent tools so indie artists can focus on what they do best
						</p>
					</AnimatedSection>
				</div>
			</section>
			{/* Content Sections */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl space-y-16'>
					{/* The Lab Years */}
					<AnimatedSection animation='fade-up'>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Lab Years
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								I spent years in research labs optimizing materials at the molecular
								level. PhD in Materials Science, degrees in Physics and Mechanical
								Engineering. I thought I&apos;d spend my career perfecting atomic
								structures and publishing papers.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								But I had a problem.
							</p>
						</div>
					</AnimatedSection>

					{/* The Artist Problem */}
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Artist Problem
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								I was also a musician. Spent nights writing songs, weekends recording,
								months crafting albums that I was genuinely proud of. Released 4-5
								painstakingly crafted records that got... tens of listeners.
							</p>
							<p className='my-8 text-center text-4xl font-bold text-white md:text-5xl'>
								<em>Tens.</em>
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								There are billions of people in the world. I knew that even a tiny
								fraction who&apos;d connect with my music could be an enormous audience.
								But somehow, incredible art was getting buried under completely
								inefficient systems.
							</p>
						</div>
					</AnimatedSection>

					{/* The Connection */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Connection
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								It hit me: this was the same problem I&apos;d been solving in the lab.
								Amazing potential - whether it&apos;s a new material or a great song -
								getting lost because the systems around it weren&apos;t optimized.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								The difference? In music, no one was applying engineering principles to
								fix it.
							</p>
						</div>
					</AnimatedSection>

					{/* The Decision */}
					<AnimatedSection animation='fade-up' delay={600}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Decision
							</H>
							<p className='mb-6 text-xl font-semibold text-white md:text-2xl'>
								So I left science to science the hell out of music marketing.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								I built barely.io from scratch - not just another dashboard, but a
								completely open-source platform where you can see exactly how everything
								works. Started testing every assumption about how artists grow, treating
								each campaign like a controlled experiment.
							</p>
						</div>
					</AnimatedSection>

					{/* The Mission */}
					<AnimatedSection animation='fade-up' delay={800}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Mission
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								My job isn&apos;t to be the star of your story. I&apos;m the engineer who
								builds the stage, tunes the sound system, and optimizes the lighting so
								you can focus on what you do best: creating art that matters.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								You handle the music, the fan connections, the creative vision. I handle
								the algorithms, the data analysis, and all the technical stuff that makes
								sure your music finds the people who&apos;ll love it.
							</p>
						</div>
					</AnimatedSection>

					{/* Why This Matters */}
					<AnimatedSection animation='fade-up' delay={1000}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Why This Matters
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								The music industry is full of black-box services that charge thousands
								while hiding how they actually work. Meanwhile, indie artists get burned
								by expensive publicists and risky playlist schemes that violate platform
								terms.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								There&apos;s a better way: transparent tools, data-driven strategies, and
								honest reporting about what&apos;s actually working.
							</p>
						</div>
					</AnimatedSection>
				</div>
			</section>
			{/* CTA Section */}
			<section className='bg-white/5 px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='scale'>
						<H size='2' className='mb-8 text-4xl md:text-5xl'>
							Ready to try a scientific approach to music marketing?
						</H>
						<div className='flex flex-col justify-center gap-6 sm:flex-row'>
							<Link href='/services'>
								<MarketingButton
									marketingLook='hero-primary'
									size='lg'
									className='min-w-[200px]'
								>
									See Our Services
								</MarketingButton>
							</Link>
							<a href='https://barely.io' target='_blank' rel='noopener noreferrer'>
								<MarketingButton
									marketingLook='scientific'
									size='lg'
									className='min-w-[200px]'
								>
									Try barely.io Tools
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
