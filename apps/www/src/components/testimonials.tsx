/* eslint-disable @next/next/no-img-element */
'use client';

import type { HTMLMotionProps, MotionValue } from 'framer-motion';
import type { RectReadOnly } from 'react-use-measure';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import * as Headless from '@headlessui/react';
import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import useMeasure from 'react-use-measure';

import { Container } from './container';
import { Link } from './link';
import { Heading, Subheading } from './text';

const testimonials = [
	{
		img: '/testimonials/tina-yards.jpg',
		name: 'Maya Rodriguez',
		title: 'Electronic Artist',
		quote:
			'barely.ai helped me go from 500 to 50K monthly listeners in 6 months. The integrated tools made everything so much easier.',
	},
	{
		img: '/testimonials/conor-neville.jpg',
		name: 'Jake Thompson',
		title: 'Indie Rock Band',
		quote:
			'Switching to barely.ai saved us $200/month and doubled our email conversion rates.',
	},
	{
		img: '/testimonials/amy-chase.jpg',
		name: 'Luna Chen',
		title: 'Singer-Songwriter',
		quote:
			'I used to juggle 6 different tools. Now everything is in one place and my fans love the seamless experience.',
	},
	{
		img: '/testimonials/veronica-winton.jpg',
		name: 'Marcus Williams',
		title: 'Hip-Hop Producer',
		quote:
			'The automation workflows are incredible. I can focus on making music while barely.ai handles my marketing.',
	},
	{
		img: '/testimonials/dillon-lenora.jpg',
		name: 'Sofia Andersson',
		title: 'Folk Artist',
		quote:
			'My merch sales tripled after switching to barely.ai. The fan data integration is a game-changer.',
	},
	{
		img: '/testimonials/harriet-arron.jpg',
		name: 'The Night Waves',
		title: 'Synth-Pop Duo',
		quote:
			"We've built a community of 10K engaged fans using barely.ai's tools. Best investment we've made.",
	},
];

function TestimonialCard({
	name,
	title,
	img,
	children,
	bounds,
	scrollX,
	...props
}: {
	img: string;
	name: string;
	title: string;
	children: React.ReactNode;
	bounds: RectReadOnly;
	scrollX: MotionValue<number>;
} & HTMLMotionProps<'div'>) {
	const ref = useRef<HTMLDivElement | null>(null);

	const computeOpacity = useCallback(() => {
		const element = ref.current;
		if (!element || bounds.width === 0) return 1;

		const rect = element.getBoundingClientRect();

		if (rect.left < bounds.left) {
			const diff = bounds.left - rect.left;
			const percent = diff / rect.width;
			return Math.max(0.5, 1 - percent);
		} else if (rect.right > bounds.right) {
			const diff = rect.right - bounds.right;
			const percent = diff / rect.width;
			return Math.max(0.5, 1 - percent);
		} else {
			return 1;
		}
	}, [ref, bounds.width, bounds.left, bounds.right]);

	const opacity = useSpring(computeOpacity(), {
		stiffness: 154,
		damping: 23,
	});

	useLayoutEffect(() => {
		opacity.set(computeOpacity());
	}, [computeOpacity, opacity]);

	useMotionValueEvent(scrollX, 'change', () => {
		opacity.set(computeOpacity());
	});

	return (
		<motion.div
			ref={ref}
			style={{ opacity }}
			{...props}
			className='relative flex aspect-[9/16] w-72 shrink-0 snap-start scroll-ml-[var(--scroll-padding)] flex-col justify-end overflow-hidden rounded-3xl sm:aspect-[3/4] sm:w-96'
		>
			<img
				alt=''
				src={img}
				className='absolute inset-x-0 top-0 aspect-square w-full object-cover'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 rounded-3xl bg-gradient-to-t from-black from-[calc(7/16*100%)] ring-1 ring-inset ring-gray-950/10 sm:from-25%'
			/>
			<figure className='relative p-10'>
				<blockquote>
					<p className='relative text-xl/7 text-white'>
						<span aria-hidden='true' className='absolute -translate-x-full'>
							"
						</span>
						{children}
						<span aria-hidden='true' className='absolute'>
							"
						</span>
					</p>
				</blockquote>
				<figcaption className='mt-6 border-t border-white/20 pt-6'>
					<p className='text-sm/6 font-medium text-white'>{name}</p>
					<p className='text-sm/6 font-medium'>
						<span className='bg-gradient-to-r from-[#fff1be] from-[28%] via-[#ee87cb] via-[70%] to-[#b060ff] bg-clip-text text-transparent'>
							{title}
						</span>
					</p>
				</figcaption>
			</figure>
		</motion.div>
	);
}

function CallToAction() {
	return (
		<div>
			<p className='max-w-sm text-sm/6 text-muted-foreground'>
				Join thousands of artists who've streamlined their music marketing with barely.ai.
				Start free today.
			</p>
			<div className='mt-2'>
				<Link
					href='/pricing'
					className='inline-flex items-center gap-2 text-sm/6 font-medium text-primary'
				>
					Start Free Trial
					<ArrowLongRightIcon className='size-5' />
				</Link>
			</div>
		</div>
	);
}

export function Testimonials() {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const { scrollX } = useScroll({ container: scrollRef });
	const [setReferenceWindowRef, bounds] = useMeasure();
	const [activeIndex, setActiveIndex] = useState(0);

	useMotionValueEvent(scrollX, 'change', x => {
		setActiveIndex(Math.floor(x / (scrollRef.current?.children[0]?.clientWidth ?? 0)));
	});

	function scrollTo(index: number) {
		const gap = 32;
		if (!scrollRef.current) return;
		const width = (scrollRef.current.children[0] as HTMLElement).offsetWidth;
		scrollRef.current.scrollTo({ left: (width + gap) * index });
	}

	return (
		<div className='overflow-hidden py-32'>
			<Container>
				<div ref={setReferenceWindowRef}>
					<Subheading>What artists are saying</Subheading>
					<Heading as='h3' className='mt-2'>
						Trusted by musicians worldwide.
					</Heading>
				</div>
			</Container>
			<div
				ref={scrollRef}
				className={clsx([
					'mt-16 flex gap-8 px-[var(--scroll-padding)]',
					'[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
					'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth',
					'[--scroll-padding:max(theme(spacing.6),calc((100vw-theme(maxWidth.2xl))/2))] lg:[--scroll-padding:max(theme(spacing.8),calc((100vw-theme(maxWidth.7xl))/2))]',
				])}
			>
				{testimonials.map(({ img, name, title, quote }, testimonialIndex) => (
					<TestimonialCard
						key={testimonialIndex}
						name={name}
						title={title}
						img={img}
						bounds={bounds}
						scrollX={scrollX}
						onClick={() => scrollTo(testimonialIndex)}
					>
						{quote}
					</TestimonialCard>
				))}
				<div className='w-[42rem] shrink-0 sm:w-[54rem]' />
			</div>
			<Container className='mt-16'>
				<div className='flex justify-between'>
					<CallToAction />
					<div className='hidden sm:flex sm:gap-2'>
						{testimonials.map(({ name }, testimonialIndex) => (
							<Headless.Button
								key={testimonialIndex}
								onClick={() => scrollTo(testimonialIndex)}
								data-active={activeIndex === testimonialIndex ? true : undefined}
								aria-label={`Scroll to testimonial from ${name}`}
								className={clsx(
									'size-2.5 rounded-full border border-transparent bg-gray-300 transition',
									'data-[active]:bg-gray-400 data-[hover]:bg-gray-400',
									'forced-colors:data-[active]:bg-[Highlight] forced-colors:data-[focus]:outline-offset-4',
								)}
							/>
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
