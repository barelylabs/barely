'use client';

import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';

interface ServiceAvailability {
	service: string;
	spots: number;
	total: number;
}

export function LimitedSpots() {
	const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

	const availability: ServiceAvailability[] = [
		{ service: 'Bedroom+', spots: 5, total: 10 },
		{ service: 'Rising+', spots: 3, total: 8 },
		{ service: 'Breakout+', spots: 2, total: 5 },
	];

	return (
		<div className='glass rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6'>
			<div className='mb-4 flex items-center gap-3'>
				<Icon.alert className='h-5 w-5 text-yellow-500' />
				<h3 className='text-lg font-semibold text-white'>
					Limited {currentMonth} Availability
				</h3>
			</div>

			<div className='space-y-3'>
				{availability.map(({ service, spots, total }) => (
					<div key={service} className='flex items-center justify-between'>
						<span className='text-white/80'>{service}</span>
						<div className='flex items-center gap-2'>
							<div className='flex gap-1'>
								{Array.from({ length: total }).map((_, i) => (
									<div
										key={i}
										className={cn(
											'h-2 w-2 rounded-full transition-colors',
											i < total - spots ? 'bg-white/20' : 'bg-green-500',
										)}
									/>
								))}
							</div>
							<span
								className={cn(
									'text-sm font-medium',
									spots <= 2 ? 'text-yellow-500' : 'text-green-500',
								)}
							>
								{spots} spots left
							</span>
						</div>
					</div>
				))}
			</div>

			<p className='mt-4 text-center text-xs text-white/50'>
				Once filled, new clients join the waitlist for next month
			</p>
		</div>
	);
}
