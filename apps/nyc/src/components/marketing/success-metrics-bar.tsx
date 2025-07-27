'use client';

import { useEffect, useState } from 'react';
import { cn } from '@barely/utils';

interface MetricData {
	artists: number;
	revenue: string;
	streams: string;
	successRate: number;
}

// TODO: Replace with real data
const METRICS: MetricData = {
	artists: 127,
	revenue: 'Growing',
	streams: '18M+',
	successRate: 94,
};

export function SuccessMetricsBar() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Show the bar after a short delay to grab attention
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={cn(
				'fixed left-0 right-0 top-16 z-40 transform transition-transform duration-500',
				isVisible ? 'translate-y-0' : '-translate-y-full',
			)}
		>
			<div className='border-b border-white/10 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md'>
				<div className='mx-auto max-w-7xl px-4 py-2'>
					<div className='flex flex-wrap items-center justify-center gap-4 text-sm md:gap-8'>
						<div className='flex items-center gap-2'>
							<span className='text-white/60'>Artists Growing:</span>
							<span className='font-semibold text-white'>{METRICS.artists}</span>
						</div>
						<div className='hidden h-4 w-px bg-white/20 md:block' />
						<div className='flex items-center gap-2'>
							<span className='text-white/60'>Artists Earning:</span>
							<span className='font-semibold text-white'>{METRICS.revenue}</span>
						</div>
						<div className='hidden h-4 w-px bg-white/20 md:block' />
						<div className='flex items-center gap-2'>
							<span className='text-white/60'>Streams Driven:</span>
							<span className='font-semibold text-white'>{METRICS.streams}</span>
						</div>
						<div className='hidden h-4 w-px bg-white/20 md:block' />
						<div className='flex items-center gap-2'>
							<span className='text-white/60'>Success Rate:</span>
							<span className='font-semibold text-white'>{METRICS.successRate}%</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
