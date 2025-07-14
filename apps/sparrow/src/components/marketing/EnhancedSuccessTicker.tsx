'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@barely/utils';

const successStories = [
	{ metric: '2.3M+', label: 'streams generated', icon: '🎵' },
	{ metric: '+847%', label: 'avg listener growth', icon: '📈' },
	{ metric: '$18.2K', label: 'in merch sales', icon: '🛍️' },
	{ metric: '12/15', label: 'tours sold out', icon: '🎤' },
	{ metric: '487', label: 'artists served', icon: '🎸' },
	{ metric: '+425%', label: 'avg revenue increase', icon: '💰' },
];

export function EnhancedSuccessTicker() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [width, setWidth] = useState<string>('auto');
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsAnimating(true);

			// Measure the next item's width before switching
			const nextIndex = (currentIndex + 1) % successStories.length;
			const tempDiv = document.createElement('div');
			tempDiv.style.visibility = 'hidden';
			tempDiv.style.position = 'absolute';
			tempDiv.className = 'inline-flex flex-col items-center gap-3 px-6 py-3';
			tempDiv.innerHTML = `
        <div class="flex items-center gap-4">
          <span class="text-2xl">${successStories[nextIndex]?.icon}</span>
          <div class="flex items-baseline gap-2 whitespace-nowrap">
            <span class="text-2xl font-bold">${successStories[nextIndex]?.metric}</span>
            <span>${successStories[nextIndex]?.label}</span>
          </div>
        </div>
        <div class="flex gap-1.5">
          ${successStories.map(() => '<div class="w-1.5 h-1.5"></div>').join('')}
        </div>
      `;
			document.body.appendChild(tempDiv);
			const newWidth = tempDiv.offsetWidth;
			document.body.removeChild(tempDiv);

			setWidth(`${newWidth}px`);

			setTimeout(() => {
				setCurrentIndex(prev => (prev + 1) % successStories.length);
				setIsAnimating(false);
			}, 300);
		}, 3000);

		return () => clearInterval(interval);
	}, [currentIndex]);

	// Set initial width
	useEffect(() => {
		if (containerRef.current) {
			setWidth(`${containerRef.current.offsetWidth}px`);
		}
	}, []);

	const current = successStories[currentIndex];

	if (!current) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className='inline-flex flex-col items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 transition-all duration-500 ease-out'
			style={{ width }}
		>
			<div className='flex items-center gap-4'>
				<span
					className={cn(
						'text-2xl transition-opacity duration-300',
						isAnimating && 'opacity-0',
					)}
					aria-hidden='true'
				>
					{current.icon}
				</span>

				<div className='flex items-baseline gap-2 whitespace-nowrap'>
					<span
						className={cn(
							'text-2xl font-bold text-green-500 transition-all duration-300',
							isAnimating && 'translate-y-2 opacity-0',
						)}
					>
						{current.metric}
					</span>
					<span
						className={cn(
							'text-white/70 transition-all duration-300',
							isAnimating && 'translate-y-2 opacity-0',
						)}
					>
						{current.label}
					</span>
				</div>
			</div>

			{/* Progress dots */}
			<div className='flex gap-1.5'>
				{successStories.map((_, index) => (
					<div
						key={index}
						className={cn(
							'h-1.5 w-1.5 rounded-full transition-all duration-300',
							index === currentIndex ? 'w-4 bg-green-500' : 'bg-white/20',
						)}
					/>
				))}
			</div>
		</div>
	);
}
