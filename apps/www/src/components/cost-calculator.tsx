'use client';

import { useState } from 'react';
import { cn, getAbsoluteUrl } from '@barely/utils';
import { CheckIcon } from '@heroicons/react/24/outline';

import { MarketingButton } from './marketing-button';

interface Tool {
	name: string;
	category: string;
	monthlyPrice: number;
	yearlyPrice: number;
	isSelected: boolean;
}

const defaultTools: Tool[] = [
	{
		name: 'Linkfire',
		category: 'Smart Links',
		monthlyPrice: 15,
		yearlyPrice: 144,
		isSelected: true,
	},
	{
		name: 'ConvertKit',
		category: 'Email Marketing',
		monthlyPrice: 29,
		yearlyPrice: 348,
		isSelected: true,
	},
	{
		name: 'Squarespace',
		category: 'Website/Landing Pages',
		monthlyPrice: 18,
		yearlyPrice: 216,
		isSelected: true,
	},
	{
		name: 'Shopify',
		category: 'E-commerce',
		monthlyPrice: 29,
		yearlyPrice: 348,
		isSelected: true,
	},
	{
		name: 'Google Analytics',
		category: 'Analytics',
		monthlyPrice: 0,
		yearlyPrice: 0,
		isSelected: false,
	},
	{
		name: 'Zapier',
		category: 'Automation',
		monthlyPrice: 29.99,
		yearlyPrice: 359.88,
		isSelected: false,
	},
	{
		name: 'Mailchimp',
		category: 'Email (Alternative)',
		monthlyPrice: 20,
		yearlyPrice: 240,
		isSelected: false,
	},
	{
		name: 'Big Cartel',
		category: 'E-commerce (Alternative)',
		monthlyPrice: 9.99,
		yearlyPrice: 119.88,
		isSelected: false,
	},
	{
		name: 'Linktree Pro',
		category: 'Link in Bio',
		monthlyPrice: 5,
		yearlyPrice: 60,
		isSelected: false,
	},
	{
		name: 'Later',
		category: 'Social Media Scheduling',
		monthlyPrice: 18,
		yearlyPrice: 216,
		isSelected: false,
	},
];

const barelyPlans = [
	{ name: 'Free', price: 0, yearlyPrice: 0 },
	{ name: 'Bedroom', price: 15, yearlyPrice: 150 },
	{ name: 'Rising', price: 35, yearlyPrice: 350 },
	{ name: 'Breakout', price: 75, yearlyPrice: 750 },
	{ name: 'Label', price: 150, yearlyPrice: 1500 },
];

export function CostCalculator() {
	const [tools, setTools] = useState<Tool[]>(defaultTools);
	const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
	const [selectedBarelyPlan, setSelectedBarelyPlan] = useState(1); // Default to Bedroom plan

	const toggleTool = (index: number) => {
		setTools(
			tools.map((tool, i) =>
				i === index ? { ...tool, isSelected: !tool.isSelected } : tool,
			),
		);
	};

	const totalToolsCost = tools
		.filter(tool => tool.isSelected)
		.reduce(
			(sum, tool) =>
				sum + (billingPeriod === 'monthly' ? tool.monthlyPrice : tool.yearlyPrice),
			0,
		);

	const barelyPlanCost =
		billingPeriod === 'monthly' ?
			(barelyPlans[selectedBarelyPlan]?.price ?? 0)
		:	(barelyPlans[selectedBarelyPlan]?.yearlyPrice ?? 0);

	const savings = totalToolsCost - barelyPlanCost;
	const savingsPercentage =
		totalToolsCost > 0 ? Math.round((savings / totalToolsCost) * 100) : 0;

	return (
		<div className='glass rounded-3xl border border-white/10 p-8'>
			<div className='mb-8 text-center'>
				<h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
					Calculate Your Savings
				</h2>
				<p className='text-lg text-muted-foreground'>
					See how much you could save by switching to barely.io
				</p>
			</div>

			{/* Billing Period Toggle */}
			<div className='mb-8 flex justify-center'>
				<div className='glass rounded-lg border border-white/10 p-1'>
					<button
						onClick={() => setBillingPeriod('monthly')}
						className={cn(
							'rounded-md px-6 py-2 text-sm font-medium transition-all duration-200',
							billingPeriod === 'monthly' ?
								'bg-primary text-white'
							:	'text-muted-foreground hover:text-white',
						)}
					>
						Monthly
					</button>
					<button
						onClick={() => setBillingPeriod('yearly')}
						className={cn(
							'rounded-md px-6 py-2 text-sm font-medium transition-all duration-200',
							billingPeriod === 'yearly' ?
								'bg-primary text-white'
							:	'text-muted-foreground hover:text-white',
						)}
					>
						Yearly
					</button>
				</div>
			</div>

			<div className='grid gap-8 lg:grid-cols-2'>
				{/* Tool Selection */}
				<div>
					<h3 className='mb-4 text-xl font-semibold text-white'>
						Select Your Current Tools
					</h3>
					<div className='space-y-3'>
						{tools.map((tool, index) => (
							<div
								key={tool.name}
								onClick={() => toggleTool(index)}
								className={cn(
									'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all duration-200',
									tool.isSelected ?
										'border-primary bg-primary/10'
									:	'border-white/10 hover:border-white/20',
								)}
							>
								<div className='flex items-center gap-3'>
									<div
										className={cn(
											'flex h-5 w-5 items-center justify-center rounded border-2',
											tool.isSelected ? 'border-primary bg-primary' : 'border-white/30',
										)}
									>
										{tool.isSelected && <CheckIcon className='h-3 w-3 text-white' />}
									</div>
									<div>
										<div className='font-medium text-white'>{tool.name}</div>
										<div className='text-sm text-muted-foreground'>{tool.category}</div>
									</div>
								</div>
								<div className='text-right'>
									<div className='font-medium text-white'>
										${billingPeriod === 'monthly' ? tool.monthlyPrice : tool.yearlyPrice}
									</div>
									<div className='text-sm text-muted-foreground'>
										{billingPeriod === 'monthly' ? '/month' : '/year'}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Results */}
				<div>
					<h3 className='mb-4 text-xl font-semibold text-white'>
						Choose Your barely.io Plan
					</h3>
					<div className='mb-6 space-y-3'>
						{barelyPlans.map((plan, index) => (
							<div
								key={plan.name}
								onClick={() => setSelectedBarelyPlan(index)}
								className={cn(
									'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all duration-200',
									selectedBarelyPlan === index ?
										'border-secondary bg-secondary/10'
									:	'border-white/10 hover:border-white/20',
								)}
							>
								<div className='flex items-center gap-3'>
									<div
										className={cn(
											'flex h-5 w-5 items-center justify-center rounded-full border-2',
											selectedBarelyPlan === index ?
												'border-secondary bg-secondary'
											:	'border-white/30',
										)}
									>
										{selectedBarelyPlan === index && (
											<div className='h-2 w-2 rounded-full bg-white' />
										)}
									</div>
									<div className='font-medium text-white'>{plan.name}</div>
								</div>
								<div className='text-right'>
									<div className='font-medium text-white'>
										${billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice}
									</div>
									<div className='text-sm text-muted-foreground'>
										{billingPeriod === 'monthly' ? '/month' : '/year'}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Savings Summary */}
					<div className='glass rounded-xl border border-white/10 p-6'>
						<div className='text-center'>
							<div className='mb-2 text-sm text-muted-foreground'>
								Total Current Tools Cost
							</div>
							<div className='mb-4 text-2xl font-bold text-white'>
								${totalToolsCost.toFixed(2)}
								{billingPeriod === 'monthly' ? '/month' : '/year'}
							</div>

							<div className='mb-2 text-sm text-muted-foreground'>barely.io Cost</div>
							<div className='mb-4 text-2xl font-bold text-secondary'>
								${barelyPlanCost.toFixed(2)}
								{billingPeriod === 'monthly' ? '/month' : '/year'}
							</div>

							{savings > 0 ?
								<>
									<div className='mb-2 text-sm text-muted-foreground'>Your Savings</div>
									<div className='mb-2 text-3xl font-bold text-primary'>
										${savings.toFixed(2)}
										{billingPeriod === 'monthly' ? '/month' : '/year'}
									</div>
									<div className='text-lg font-medium text-primary'>
										Save {savingsPercentage}%
									</div>
								</>
							: savings < 0 ?
								<>
									<div className='mb-2 text-sm text-muted-foreground'>
										Additional Cost
									</div>
									<div className='mb-2 text-2xl font-bold text-yellow-500'>
										${Math.abs(savings).toFixed(2)}
										{billingPeriod === 'monthly' ? '/month' : '/year'}
									</div>
									<div className='text-sm text-muted-foreground'>
										But you get all tools integrated + better features
									</div>
								</>
							:	<>
									<div className='mb-2 text-2xl font-bold text-primary'>Same Cost</div>
									<div className='text-sm text-muted-foreground'>
										But with full integration and better features
									</div>
								</>
							}
						</div>
					</div>

					<div className='mt-6 text-center'>
						<MarketingButton
							variant='hero-primary'
							href={getAbsoluteUrl('app', 'register')}
							glow
						>
							Start Saving Today
						</MarketingButton>
					</div>
				</div>
			</div>

			{/* Additional Benefits */}
			<div className='mt-8 border-t border-white/10 pt-8'>
				<h4 className='mb-4 text-center text-lg font-semibold text-white'>
					Plus, you get these benefits at no extra cost:
				</h4>
				<div className='grid gap-4 md:grid-cols-3'>
					<div className='text-center'>
						<div className='font-semibold text-primary'>Full Integration</div>
						<div className='text-sm text-muted-foreground'>
							All tools work together seamlessly
						</div>
					</div>
					<div className='text-center'>
						<div className='font-semibold text-primary'>Better Analytics</div>
						<div className='text-sm text-muted-foreground'>
							Complete fan journey tracking
						</div>
					</div>
					<div className='text-center'>
						<div className='font-semibold text-primary'>One Login</div>
						<div className='text-sm text-muted-foreground'>
							No more juggling multiple accounts
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
