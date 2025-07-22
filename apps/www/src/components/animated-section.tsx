'use client';

import { cn } from '@barely/utils';

import { useIntersection } from '@barely/ui/hooks';

interface AnimatedSectionProps {
	children: React.ReactNode;
	className?: string;
	animation?: 'fade-up' | 'fade-in' | 'scale' | 'slide-left' | 'slide-right';
	delay?: number;
	threshold?: number;
	triggerOnce?: boolean;
}

export function AnimatedSection({
	children,
	className,
	animation = 'fade-up',
	delay = 0,
	threshold = 0.1,
	triggerOnce = true,
}: AnimatedSectionProps) {
	const { ref, isIntersecting } = useIntersection<HTMLDivElement>({
		threshold,
		triggerOnce,
	});

	const animationClasses = {
		'fade-up': 'translate-y-8 opacity-0',
		'fade-in': 'opacity-0',
		scale: 'scale-95 opacity-0',
		'slide-left': 'translate-x-8 opacity-0',
		'slide-right': '-translate-x-8 opacity-0',
	};

	const visibleClasses = 'translate-x-0 translate-y-0 scale-100 opacity-100';

	return (
		<div
			ref={ref}
			className={cn(
				'transition-all duration-700 ease-out',
				!isIntersecting && animationClasses[animation],
				isIntersecting && visibleClasses,
				className,
			)}
			style={{
				transitionDelay: isIntersecting ? `${delay}ms` : '0ms',
			}}
		>
			{children}
		</div>
	);
}
