'use client';

import { cn, formatMinorToMajorCurrency } from '@barely/utils';
import { CheckIcon, SparklesIcon } from 'lucide-react';

import { Badge } from '@barely/ui/badge';
import { Text } from '@barely/ui/typography';

interface PaymentOptions {
	oneTime: { total: number; label: string };
	recurring: {
		total: number;
		originalTotal: number;
		discountAmount: number;
		discountPercent: number;
		billingInterval: string;
		annualSavings: number;
		label: string;
	};
	currency: 'usd' | 'gbp';
}

interface PaymentTypeToggleProps {
	options: PaymentOptions;
	selectedType: 'oneTime' | 'recurring';
	onTypeChange: (type: 'oneTime' | 'recurring') => void;
}

export function PaymentTypeToggle({
	options,
	selectedType,
	onTypeChange,
}: PaymentTypeToggleProps) {
	// Helper to convert billing interval to proper grammar
	const formatInterval = (
		interval: string,
		context: 'every' | 'per' | 'this' | 'next',
	) => {
		const singular = interval.replace(/s$/, ''); // Remove trailing 's' if present
		switch (context) {
			case 'every':
			case 'next':
				return singular;
			case 'per':
				return singular;
			case 'this':
				return singular;
			default:
				return interval;
		}
	};
	return (
		<div className='space-y-4'>
			<Text variant='lg/semibold' className='text-gray-900'>
				Choose Payment Option
			</Text>

			{/* Recurring Option (Default - Set up Auto-Pay) */}
			<div
				className={cn(
					'relative cursor-pointer rounded-lg border-2 p-5 transition-all hover:shadow-md',
					selectedType === 'recurring' ?
						'border-blue-500 bg-blue-50/50'
					:	'border-gray-200 hover:border-gray-300',
				)}
				onClick={() => onTypeChange('recurring')}
			>
				{/* Checkmark for selected state */}
				{selectedType === 'recurring' && (
					<div className='absolute right-4 top-4'>
						<CheckIcon className='h-5 w-5 text-blue-600' />
					</div>
				)}

				<div className='space-y-4'>
					{/* Header with radio button */}
					<div className='flex items-start gap-3'>
						<input
							type='radio'
							checked={selectedType === 'recurring'}
							onChange={() => onTypeChange('recurring')}
							className='mt-1 h-4 w-4 text-blue-600'
							onClick={e => e.stopPropagation()}
						/>
						<div className='flex-1'>
							<div className='flex items-center gap-2'>
								<Text variant='lg/semibold' className='text-gray-900'>
									Set up Auto-Pay
								</Text>
								{selectedType !== 'recurring' && (
									<Badge
										variant='success'
										size='sm'
										className='bg-green-100 text-green-700'
									>
										<SparklesIcon className='mr-1 h-3 w-3' />
										Recommended
									</Badge>
								)}
							</div>
							<Text variant='sm/normal' className='mt-1 text-gray-600'>
								Billed automatically every{' '}
								{formatInterval(options.recurring.billingInterval, 'every')}
							</Text>
						</div>
					</div>

					{/* Pricing */}
					<div className='flex items-baseline justify-between'>
						<div className='flex items-baseline gap-2'>
							<Text variant='2xl/semibold' className='text-gray-900'>
								{formatMinorToMajorCurrency(options.recurring.total, options.currency)}
							</Text>
							<Text variant='sm/normal' className='text-gray-600'>
								per {formatInterval(options.recurring.billingInterval, 'per')}
							</Text>
						</div>
						{options.recurring.discountAmount > 0 && (
							<Text
								variant='sm/medium'
								className='text-gray-400 line-through decoration-2'
							>
								{formatMinorToMajorCurrency(
									options.recurring.originalTotal,
									options.currency,
								)}
							</Text>
						)}
					</div>
				</div>

				{/* Benefits */}
				<div className='mt-4 space-y-3 border-t pt-4'>
					{options.recurring.discountAmount > 0 && (
						<div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
							<div className='flex items-center gap-2'>
								<SparklesIcon className='h-4 w-4 text-green-600' />
								<Text variant='sm/semibold' className='text-green-800'>
									Save {options.recurring.discountPercent}% every{' '}
									{formatInterval(options.recurring.billingInterval, 'every')}
								</Text>
							</div>
							{options.recurring.annualSavings > 0 && (
								<Badge
									variant='success'
									className={cn(
										'text-white',
										selectedType === 'recurring' ?
											'bg-green-700 ring-1 ring-white/50'
										:	'bg-green-600',
									)}
								>
									{formatMinorToMajorCurrency(
										options.recurring.annualSavings,
										options.currency,
									)}
									/year
								</Badge>
							)}
						</div>
					)}
					<ul className='space-y-2 text-sm text-gray-600'>
						<li className='flex items-center gap-2'>
							<CheckIcon className='h-3.5 w-3.5 text-gray-400' />
							<span>Never miss a payment</span>
						</li>
						<li className='flex items-center gap-2'>
							<CheckIcon className='h-3.5 w-3.5 text-gray-400' />
							<span>Cancel anytime</span>
						</li>
					</ul>
				</div>
			</div>

			{/* One-time Option (Pay Manually) */}
			<div
				className={cn(
					'relative cursor-pointer rounded-lg border-2 p-5 transition-all hover:shadow-md',
					selectedType === 'oneTime' ?
						'border-blue-500 bg-blue-50/50'
					:	'border-gray-200 hover:border-gray-300',
				)}
				onClick={() => onTypeChange('oneTime')}
			>
				{selectedType === 'oneTime' && (
					<div className='absolute right-4 top-4'>
						<CheckIcon className='h-5 w-5 text-blue-600' />
					</div>
				)}

				<div className='space-y-4'>
					{/* Header with radio button */}
					<div className='flex items-start gap-3'>
						<input
							type='radio'
							checked={selectedType === 'oneTime'}
							onChange={() => onTypeChange('oneTime')}
							className='mt-1 h-4 w-4 text-blue-600'
							onClick={e => e.stopPropagation()}
						/>
						<div className='flex-1'>
							<Text variant='lg/semibold' className='text-gray-900'>
								Pay Manually
							</Text>
							<Text variant='sm/normal' className='mt-1 text-gray-600'>
								Pay for this {formatInterval(options.recurring.billingInterval, 'this')}{' '}
								only
							</Text>
						</div>
					</div>

					{/* Pricing */}
					<div className='flex items-baseline justify-between'>
						<div className='flex items-baseline gap-2'>
							<Text variant='2xl/semibold' className='text-gray-900'>
								{formatMinorToMajorCurrency(options.oneTime.total, options.currency)}
							</Text>
							<Text variant='sm/normal' className='text-gray-600'>
								for this {formatInterval(options.recurring.billingInterval, 'this')}
							</Text>
						</div>
					</div>

					{/* Info */}
					<div className='mt-4 space-y-2 border-t pt-4'>
						<ul className='space-y-2 text-sm text-gray-600'>
							<li className='flex items-center gap-2'>
								<span className='ml-5'>One-time payment for this period</span>
							</li>
							<li className='flex items-center gap-2'>
								<span className='ml-5'>
									Remember to pay again next{' '}
									{formatInterval(options.recurring.billingInterval, 'next')}
								</span>
							</li>
							{options.recurring.discountAmount > 0 && (
								<li className='flex items-center gap-2 text-gray-500'>
									<span className='ml-5'>No discount applied</span>
								</li>
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
