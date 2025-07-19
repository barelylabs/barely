'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function EarlyAccessBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<div className='relative w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex items-center justify-between'>
					<div className='flex-1 px-8'>
						<p className='text-center text-sm font-medium'>
							🚀 <strong>Early Access:</strong> Lifetime pricing for first 100 artists •
							37 spots left
						</p>
					</div>
					<button
						onClick={() => setIsVisible(false)}
						className='ml-2 flex-shrink-0 rounded-md p-1 transition-colors hover:bg-white/20'
						aria-label='Close banner'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
			</div>
		</div>
	);
}
