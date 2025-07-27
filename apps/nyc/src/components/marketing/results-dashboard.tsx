'use client';

import { useEffect, useState } from 'react';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

interface ServiceTierMetrics {
	name: string;
	avgGrowth: number;
	successRate: number;
	totalClients: number;
	color: string;
}

const serviceMetrics: ServiceTierMetrics[] = [
	{
		name: 'Bedroom+',
		avgGrowth: 425,
		successRate: 92,
		totalClients: 234,
		color: 'from-purple-500 to-purple-600',
	},
	{
		name: 'Rising+',
		avgGrowth: 847,
		successRate: 96,
		totalClients: 189,
		color: 'from-blue-500 to-blue-600',
	},
	{
		name: 'Breakout+',
		avgGrowth: 1250,
		successRate: 98,
		totalClients: 64,
		color: 'from-pink-500 to-pink-600',
	},
];

const genreDistribution = [
	{ genre: 'Hip-Hop', percentage: 28, count: 136 },
	{ genre: 'Electronic', percentage: 22, count: 107 },
	{ genre: 'Indie Rock', percentage: 18, count: 88 },
	{ genre: 'Pop', percentage: 15, count: 73 },
	{ genre: 'Folk/Singer-Songwriter', percentage: 12, count: 58 },
	{ genre: 'Other', percentage: 5, count: 25 },
];

export function ResultsDashboard() {
	const [animatedValue, setAnimatedValue] = useState(0);
	const targetValue = 2347892; // Total streams generated

	useEffect(() => {
		const duration = 2000; // 2 seconds
		const increment = targetValue / (duration / 16); // 60fps
		let current = 0;

		const timer = setInterval(() => {
			current += increment;
			if (current >= targetValue) {
				setAnimatedValue(targetValue);
				clearInterval(timer);
			} else {
				setAnimatedValue(Math.floor(current));
			}
		}, 16);

		return () => clearInterval(timer);
	}, [targetValue]);

	return (
		<div className='glass rounded-2xl p-8'>
			<H size='3' className='mb-8 text-center text-3xl'>
				Transparent Results Across All Clients
			</H>

			{/* Total Streams Counter */}
			<div className='mb-12 text-center'>
				<div className='mb-2 flex items-center justify-center gap-2'>
					<Icon.playCircle className='h-6 w-6 text-green-500' />
					<p className='text-white/60'>Total Streams Generated</p>
				</div>
				<p className='text-5xl font-bold text-green-500 md:text-6xl'>
					{animatedValue.toLocaleString()}+
				</p>
			</div>

			{/* Service Tier Metrics */}
			<div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
				{serviceMetrics.map((tier, index) => (
					<div
						key={tier.name}
						className='rounded-xl border border-white/10 bg-white/5 p-6'
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<h4 className='mb-4 font-semibold text-white'>{tier.name}</h4>

						<div className='space-y-3'>
							<div>
								<div className='mb-1 flex items-center gap-2'>
									<Icon.rocket className='h-4 w-4 text-purple-500' />
									<p className='text-sm text-white/60'>Avg Growth</p>
								</div>
								<p className='text-2xl font-bold text-white'>+{tier.avgGrowth}%</p>
							</div>

							<div>
								<div className='mb-1 flex items-center gap-2'>
									<Icon.target className='h-4 w-4 text-green-500' />
									<p className='text-sm text-white/60'>Success Rate</p>
								</div>
								<div className='flex items-center gap-2'>
									<div className='h-2 flex-1 overflow-hidden rounded-full bg-white/10'>
										<div
											className={cn('h-full rounded-full bg-gradient-to-r', tier.color)}
											style={{ width: `${tier.successRate}%` }}
										/>
									</div>
									<span className='text-sm text-white'>{tier.successRate}%</span>
								</div>
							</div>

							<div>
								<div className='mb-1 flex items-center gap-2'>
									<Icon.users className='h-4 w-4 text-blue-500' />
									<p className='text-sm text-white/60'>Total Clients</p>
								</div>
								<p className='text-lg text-white'>{tier.totalClients}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Genre Distribution */}
			<div>
				<div className='mb-4 flex items-center gap-2'>
					<Icon.music className='h-5 w-5 text-purple-500' />
					<h4 className='font-semibold text-white'>Success Across All Genres</h4>
				</div>
				<div className='space-y-3'>
					{genreDistribution.map((genre, index) => (
						<div key={genre.genre} className='flex items-center gap-4'>
							<div className='w-32 text-sm text-white/60'>{genre.genre}</div>
							<div className='flex-1'>
								<div className='h-6 overflow-hidden rounded-full bg-white/10'>
									<div
										className='flex h-full items-center justify-end rounded-full bg-gradient-to-r from-purple-500 to-pink-500 pr-2'
										style={{
											width: `${genre.percentage}%`,
											animationDelay: `${index * 50}ms`,
										}}
									>
										<span className='text-xs font-medium text-white'>{genre.count}</span>
									</div>
								</div>
							</div>
							<div className='w-12 text-right text-sm text-white/60'>
								{genre.percentage}%
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Disclaimer */}
			<p className='mt-8 text-center text-xs text-white/40'>
				* Results vary by artist, genre, and market conditions. These figures represent
				averages across all clients from 2023-2024.
			</p>
		</div>
	);
}
