'use client';

import Link from 'next/link';

import { useIntersection } from '../../hooks/useIntersection';
import { AnimatedSection } from './AnimatedSection';
import { MarketingButton } from './Button';

export function FounderStoryTeaser() {
	const { ref: parallaxRef, isIntersecting } = useIntersection({
		threshold: 0,
		triggerOnce: false,
	});

	return (
		<section ref={parallaxRef} className='relative h-[600px] overflow-hidden'>
			{/* Background with parallax effect */}
			<div
				className='absolute inset-0 transition-transform duration-1000 ease-out'
				style={{
					transform: isIntersecting ? 'translateY(0)' : 'translateY(50px)',
				}}
			>
				{/* Gradient background simulating an image */}
				<div
					className='absolute inset-0'
					style={{
						background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
					}}
				/>

				{/* Overlay */}
				<div className='absolute inset-0 bg-black/60' />
			</div>

			{/* Content */}
			<div className='relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<blockquote className='mb-8 text-2xl font-light italic leading-relaxed text-white/90 md:text-3xl lg:text-4xl'>
							&ldquo;After spending years in research labs optimizing materials at the
							molecular level, I realized musicians faced the same problem - incredible
							art buried under inefficient systems. So I left science to build the tools
							and methods that help artists break through the noise.&rdquo;
						</blockquote>
					</AnimatedSection>

					<AnimatedSection animation='fade-up' delay={200}>
						<Link href='/about'>
							<MarketingButton marketingLook='glass' size='lg' className='mt-8'>
								Read My Story
							</MarketingButton>
						</Link>
					</AnimatedSection>
				</div>
			</div>
		</section>
	);
}
