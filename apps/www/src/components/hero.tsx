'use client';

import { useEffect, useRef, useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';

import { AnimatedSection } from './animated-section';
import { ContactModal } from './contact-modal';
import { MarketingButton } from './marketing-button';

export function Hero() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [showContactModal, setShowContactModal] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const particles: {
			x: number;
			y: number;
			vx: number;
			vy: number;
			radius: number;
			opacity: number;
		}[] = [];

		// Create particles
		for (let i = 0; i < 50; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
				radius: Math.random() * 2 + 1,
				opacity: Math.random() * 0.5 + 0.1,
			});
		}

		let animationId: number;

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			particles.forEach(particle => {
				particle.x += particle.vx;
				particle.y += particle.vy;

				if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
				if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
				ctx.fill();
			});

			animationId = requestAnimationFrame(animate);
		};

		animate();

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<section className='relative -mt-[70px] min-h-screen overflow-hidden bg-background'>
			{/* Background gradient mesh */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20' />

			{/* Animated particles */}
			<canvas
				ref={canvasRef}
				className='absolute inset-0 opacity-30'
				aria-hidden='true'
			/>

			{/* Content */}
			<div className='relative z-10 flex min-h-screen items-center pt-[70px]'>
				<div className='mx-auto max-w-7xl px-6 lg:px-8'>
					<div className='mx-auto max-w-3xl text-center'>
						<AnimatedSection animation='fade-up'>
							<div className='mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-3 py-1 text-sm font-medium text-white/90 ring-1 ring-white/10'>
								🚀 Early Access
							</div>
							<h1 className='mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl'>
								The Open-Source Marketing Platform{' '}
								<span className='gradient-text'>Built for Indie Artists</span>
							</h1>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={100}>
							<p className='mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
								Find, grow, and monetize your fanbase with the only platform built
								specifically for musicians. Every tool you need, integrated and
								transparent.
							</p>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={200}>
							<div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
								<MarketingButton
									variant='hero-primary'
									href={getAbsoluteUrl('app', 'register?ref=www/hero')}
									glow
								>
									Start Building Free
								</MarketingButton>
								<MarketingButton
									variant='hero-secondary'
									onClick={() => setShowContactModal(true)}
								>
									Book a Demo
								</MarketingButton>
							</div>
						</AnimatedSection>

						<AnimatedSection animation='fade-up' delay={300}>
							<p className='mt-8 text-sm text-muted-foreground'>
								Built in Brooklyn by music marketing engineers who've helped indie artists
								grow from bedroom producers to breakout successes.
							</p>
						</AnimatedSection>
					</div>
				</div>
			</div>

			{/* Bottom gradient fade */}
			<div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent' />

			{/* Contact Modal */}
			<ContactModal
				show={showContactModal}
				onClose={() => setShowContactModal(false)}
				variant='demo'
			/>
		</section>
	);
}
