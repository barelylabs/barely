'use client';

import { useEffect, useState } from 'react';

interface UseCountUpOptions {
	end: number;
	duration?: number;
	delay?: number;
	decimals?: number;
	suffix?: string;
	prefix?: string;
}

export function useCountUp({
	end,
	duration = 2000,
	delay = 0,
	decimals = 0,
	suffix = '',
	prefix = '',
}: UseCountUpOptions) {
	const [count, setCount] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (!isAnimating) return;

		const startTime = Date.now();
		const endValue = end;

		const animate = () => {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (ease-out-expo)
			const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
			const currentValue = easeOutExpo * endValue;

			setCount(currentValue);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		const timeoutId = setTimeout(() => {
			requestAnimationFrame(animate);
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [isAnimating, end, duration, delay]);

	const start = () => setIsAnimating(true);
	const reset = () => {
		setIsAnimating(false);
		setCount(0);
	};

	const formattedCount = `${prefix}${count.toFixed(decimals)}${suffix}`;

	return { count, formattedCount, start, reset };
}
