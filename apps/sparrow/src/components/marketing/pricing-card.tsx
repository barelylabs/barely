'use client';

import { cn } from '@barely/utils';

import { H } from '@barely/ui/typography';

import { MarketingButton } from './button';

interface PricingCardProps {
	title: string;
	price: string;
	originalPrice?: string;
	period?: string;
	description: string;
	features: string[];
	ctaText?: string;
	featured?: boolean;
	className?: string;
	spotsLeft?: number;
	onCTAClick?: () => void;
}

export function PricingCard({
	title,
	price,
	originalPrice,
	period = '/month',
	description,
	features,
	ctaText = 'Get Started',
	featured = false,
	className,
	spotsLeft,
	onCTAClick,
}: PricingCardProps) {
	return (
		<div
			className={cn(
				'relative rounded-2xl p-8',
				'glass border',
				featured ? 'border-purple-500/50' : 'border-white/10',
				'transition-all duration-150',
				'hover:scale-105',
				featured && 'shadow-[0_0_60px_rgba(168,85,247,0.4)]',
				className,
			)}
		>
			{featured && (
				<div className='absolute -top-4 left-1/2 -translate-x-1/2'>
					<span className='rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white'>
						Most Popular
					</span>
				</div>
			)}

			{spotsLeft !== undefined && (
				<div className='absolute -top-4 right-4'>
					<span
						className={cn(
							'rounded-full px-3 py-1 text-xs font-medium',
							spotsLeft <= 2 ?
								'bg-yellow-500/20 text-yellow-500'
							:	'bg-green-500/20 text-green-500',
						)}
					>
						{spotsLeft} spots left
					</span>
				</div>
			)}

			<div className='space-y-6'>
				<div>
					<H size='4' className='mb-2 text-white'>
						{title}
					</H>
					<p className='text-white/70'>{description}</p>
				</div>

				<div className='space-y-1'>
					{originalPrice && (
						<div className='flex items-center gap-2'>
							<span className='text-sm font-medium text-purple-300'>
								First Month Special
							</span>
						</div>
					)}
					<div className='flex items-baseline gap-1'>
						{originalPrice && (
							<span className='text-2xl text-white/40 line-through'>{originalPrice}</span>
						)}
						<span className='text-4xl font-bold text-white'>{price}</span>
						<span className='text-white/70'>{period}</span>
					</div>
				</div>

				<ul className='space-y-3'>
					{features.map((feature, index) => (
						<li key={index} className='flex items-start gap-3'>
							<span className='mt-0.5 text-green-500'>✓</span>
							<span className='text-sm text-white/80'>{feature}</span>
						</li>
					))}
				</ul>

				<MarketingButton
					marketingLook={featured ? 'hero-primary' : 'glass'}
					size='lg'
					fullWidth
					onClick={onCTAClick}
				>
					{ctaText}
				</MarketingButton>
			</div>
		</div>
	);
}
