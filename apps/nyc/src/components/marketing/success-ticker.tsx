'use client';

import { useEffect, useRef, useState } from 'react';

export function SuccessTicker() {
	const [count, setCount] = useState(0);
	const [maxWidth, setMaxWidth] = useState(0);
	const spanRef = useRef<HTMLSpanElement>(null);
	const targetCount = 2300000; // 2.3M
	const duration = 2000; // 2 seconds

	useEffect(() => {
		const startTime = Date.now();
		const timer = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const currentCount = Math.floor(easeOutQuart * targetCount);

			setCount(currentCount);

			if (progress >= 1) {
				clearInterval(timer);
			}
		}, 16); // ~60fps

		return () => clearInterval(timer);
	}, []);

	const formattedCount = count.toLocaleString();

	// Track the maximum width reached
	useEffect(() => {
		if (spanRef.current) {
			const currentWidth = spanRef.current.offsetWidth;
			if (currentWidth > maxWidth) {
				setMaxWidth(currentWidth);
			}
		}
	}, [formattedCount, maxWidth]);

	return (
		<div className='relative'>
			<div className='glass rounded-full border border-purple-500/20 px-6 py-3 transition-all duration-300 ease-out'>
				<div className='flex items-center gap-3'>
					<div className='relative'>
						<div className='absolute inset-0 animate-pulse rounded-full bg-purple-500 opacity-50 blur-lg' />
						<div className='relative h-2 w-2 rounded-full bg-purple-400' />
					</div>
					<p className='flex items-baseline font-semibold text-white'>
						<span
							ref={spanRef}
							className='gradient-text inline-block text-right text-2xl font-bold transition-all duration-300'
							style={{ minWidth: maxWidth ? `${maxWidth}px` : '140px' }}
						>
							{formattedCount}+
						</span>
						<span className='ml-2 text-white/70'>streams generated for artists</span>
					</p>
				</div>
			</div>
		</div>
	);
}
