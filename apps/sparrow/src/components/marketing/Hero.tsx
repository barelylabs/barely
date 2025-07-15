'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

import { H } from '@barely/ui/typography';

import { AnimatedSection } from './AnimatedSection';
import { MarketingButton } from './Button';

export function Hero() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas size
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		// Particle system
		const particles: {
			x: number;
			y: number;
			vx: number;
			vy: number;
			size: number;
			opacity: number;
		}[] = [];

		const particleCount = 40;

		// Initialize particles
		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				size: Math.random() * 4 + 2,
				opacity: Math.random() * 0.7 + 0.3,
			});
		}

		// Animation loop
		let animationId: number;
		let isVisible = true;
		
		const animate = () => {
			if (!isVisible) return;
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Update and draw particles
			particles.forEach(particle => {
				particle.x += particle.vx;
				particle.y += particle.vy;

				// Wrap around edges
				if (particle.x < 0) particle.x = canvas.width;
				if (particle.x > canvas.width) particle.x = 0;
				if (particle.y < 0) particle.y = canvas.height;
				if (particle.y > canvas.height) particle.y = 0;

				// Draw particle
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity})`;
				ctx.fill();
			});

			// Draw connections (limit connections per particle for performance)
			particles.forEach((particle, i) => {
				let connections = 0;
				particles.slice(i + 1).forEach(otherParticle => {
					if (connections >= 3) return; // Limit to 3 connections per particle

					const distance = Math.sqrt(
						Math.pow(particle.x - otherParticle.x, 2) +
							Math.pow(particle.y - otherParticle.y, 2),
					);

					if (distance < 150) {
						ctx.beginPath();
						ctx.moveTo(particle.x, particle.y);
						ctx.lineTo(otherParticle.x, otherParticle.y);
						ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * (1 - distance / 150)})`;
						ctx.stroke();
						connections++;
					}
				});
			});

			animationId = requestAnimationFrame(animate);
		};

		// Set up intersection observer
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry) {
					isVisible = entry.isIntersecting;
					if (isVisible) {
						animate();
					} else {
						cancelAnimationFrame(animationId);
					}
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(canvas);
		animate();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			cancelAnimationFrame(animationId);
			observer.disconnect();
		};
	}, []);

	return (
		<section className='relative flex min-h-screen items-center justify-center overflow-hidden'>
			{/* Background gradient */}
			<div
				className='absolute inset-0 opacity-60'
				style={{
					background: 'var(--gradient-mesh)',
				}}
			/>

			{/* Particle canvas */}
			<canvas ref={canvasRef} className='absolute inset-0 opacity-50' />

			{/* Noise texture */}
			<div className='noise absolute inset-0 opacity-30' />

			{/* Content */}
			<div className='relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8'>
				<AnimatedSection animation='fade-up'>
					<H
						size='1'
						className='mb-6 font-heading text-5xl leading-tight md:text-7xl lg:text-8xl'
					>
						Finally, Music Marketing
						<br />
						<span className='gradient-text'>That Makes Sense</span>
					</H>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={200}>
					<p className='mx-auto mb-8 max-w-3xl text-xl text-white/70 md:text-2xl'>
						Build your fanbase, make real money, and keep creative control with
						transparent, data-driven marketing.
					</p>
					<div className='mb-8 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm text-yellow-500'>
						<span className='inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-500' />
						Limited spots available for{' '}
						{new Date().toLocaleDateString('en-US', { month: 'long' })}
					</div>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={400}>
					<div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
						<a href='/services'>
							<MarketingButton
								marketingLook='hero-primary'
								size='lg'
								className='min-w-[200px]'
							>
								Launch Your Career
							</MarketingButton>
						</a>
						<Link href='/case-studies'>
							<MarketingButton
								marketingLook='hero-secondary'
								size='lg'
								className='min-w-[200px]'
							>
								See Success Stories
							</MarketingButton>
						</Link>
					</div>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={600}>
					<div className='mt-16 flex justify-center'>
						<button
							onClick={() => {
								window.scrollTo({
									top: window.innerHeight,
									behavior: 'smooth',
								});
							}}
							className='flex cursor-pointer items-center gap-2 text-white/50 transition-colors hover:text-white'
						>
							<span className='text-sm'>Scroll to explore</span>
							<svg
								className='h-4 w-4 animate-bounce'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 14l-7 7m0 0l-7-7m7 7V3'
								/>
							</svg>
						</button>
					</div>
				</AnimatedSection>
			</div>
		</section>
	);
}
