import type { Metadata } from 'next';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { MarketingButton } from '../../components/marketing/button';
import { PhDBadge } from '../../components/marketing/trust-badges';

export const metadata: Metadata = {
	title: 'About - From Lab to Brooklyn Studio | Barely NYC',
	description:
		'The PhD scientist who became a Music Marketing Engineer in Brooklyn. Building transparent growth systems for indie artists worldwide.',
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
							I Brought My PhD to Music Marketing
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Brooklyn-based music marketing engineers building data-driven growth systems
							for indie artists worldwide
						</p>
						<div className='mt-6'>
							<PhDBadge className='mx-auto' />
						</div>
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
								level. PhD in Materials Science & Engineering from University of Michigan
								(2015), double major in Physics and Mechanical Engineering from University
								of Arkansas (2010). Research Fellow at NIST, then VP of Engineering at an
								organic solar startup. I thought I&apos;d spend my career perfecting
								atomic structures and building clean energy solutions.
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
								I was also a musician. Released albums in 2006, 2012, and 2019 that got...
								tens of listeners.
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

					{/* The Turning Point */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Turning Point
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								In 2020, I decided to apply my engineering training to marketing Proper
								Youth&apos;s debut album, &quot;So Close to Paradise.&quot; The hit single
								&quot;Off My Mind&quot; has since gained 1.8M streams - not because the
								music suddenly got better, but because I finally understood how to
								optimize the system around it.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								Word spread. Every artist who reached out had been burned by the same
								expensive failures - playlist pitching services, publicists who delivered
								nothing, pay-for-play schemes, even fake streams. They&apos;d spent
								thousands with nothing to show for it.
							</p>
						</div>
					</AnimatedSection>

					{/* The Decision */}
					<AnimatedSection animation='fade-up' delay={600}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								The Decision
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								By 2022, I realized I was more excited about helping musicians market the
								right way than working on materials. The problem was the same - amazing
								potential getting lost in inefficient systems. The difference? In music,
								no one was applying engineering principles to fix it.
							</p>
							<p className='mb-6 text-xl font-semibold text-white md:text-2xl'>
								So I left my VP role to science the hell out of music marketing.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								I built barely.ai from scratch - not just another dashboard, but a
								completely open-source platform where artists can see exactly how
								everything works. Started testing every assumption about how artists grow,
								treating each campaign like a controlled experiment.
							</p>
						</div>
					</AnimatedSection>

					{/* Brooklyn Base */}
					<AnimatedSection animation='fade-up' delay={700}>
						<div className='space-y-6'>
							<H size='3' className='gradient-text text-3xl md:text-4xl'>
								Building From Brooklyn
							</H>
							<p className='text-lg leading-relaxed text-white/80'>
								In 2023, I moved to Brooklyn to set up Barely NYC. It made sense - this is
								where music and technology collide, where the indie spirit drives
								innovation.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								While our agency is based in Brooklyn, the artists we work with are
								everywhere. We've engineered growth for bands in LA, Nashville, Cleveland,
								South Wales, and Paris. Our data-driven approach translates across time
								zones and genres - because good science is universal.
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
								As music marketing engineers, we apply scientific methods to grow your
								fanbase. We run controlled experiments, analyze the data, and optimize
								based on results - not hunches or industry myths.
							</p>
							<p className='text-lg leading-relaxed text-white/80'>
								You focus on the creative. We handle the engineering - attribution
								modeling, conversion optimization, algorithmic distribution. It's a
								partnership where art meets science.
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
							<a href='https://barely.ai' target='_blank' rel='noopener noreferrer'>
								<MarketingButton
									marketingLook='scientific'
									size='lg'
									className='min-w-[200px]'
								>
									Try barely.ai Tools
								</MarketingButton>
							</a>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
