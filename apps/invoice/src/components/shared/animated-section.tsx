'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@barely/utils';

interface AnimatedSectionProps {
	children: React.ReactNode;
	className?: string;
	animation?: 'fade-up' | 'fade-in' | 'slide-in-left' | 'slide-in-right';
	delay?: number;
}

export function AnimatedSection({
	children,
	className,
	animation = 'fade-up',
	delay = 0,
}: AnimatedSectionProps) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setTimeout(() => {
						setIsVisible(true);
					}, delay);
				}
			},
			{
				threshold: 0.1,
				rootMargin: '50px',
			},
		);

		if (element) {
			observer.observe(element);
		}

		return () => {
			if (element) {
				observer.unobserve(element);
			}
		};
	}, [delay]);

	const animationClasses = {
		'fade-up': isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
		'fade-in': isVisible ? 'opacity-100' : 'opacity-0',
		'slide-in-left':
			isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0',
		'slide-in-right':
			isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0',
	};

	return (
		<div
			ref={ref}
			className={cn(
				'transition-all duration-700 ease-out',
				animationClasses[animation],
				className,
			)}
		>
			{children}
		</div>
	);
}
