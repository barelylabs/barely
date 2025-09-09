'use client';

import type { PlanType } from '@barely/const';
import { WORKSPACE_PLANS } from '@barely/const';
import { useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { parseAsStringEnum, useQueryStates } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

export default function InvoicePlansPage() {
	const { workspace } = useWorkspace();
	const trpc = useTRPC();
	const currentPlan = workspace.plan;

	// Use nuqs for URL state management (only billing cycle for invoice)
	const [params, setParams] = useQueryStates({
		billing: parseAsStringEnum(['monthly', 'yearly']).withDefault('yearly'),
	});

	const billingPeriod = params.billing;

	// Get the invoice plans
	const freePlan = WORKSPACE_PLANS.get('free');
	const proPlan = WORKSPACE_PLANS.get('invoice.pro');

	// Helper to get price display
	const getPriceDisplay = (plan: typeof proPlan) => {
		if (!plan) return 0;
		const price =
			billingPeriod === 'monthly' ?
				plan.price.monthly.amount
			:	Math.round(plan.price.yearly.amount / 12);
		return price;
	};

	// Helper to check if plan is current
	const isCurrentPlan = (planId: string) => currentPlan === planId;

	// Upgrade mutation
	const { mutate: upgradePlan, isPending } = useMutation(
		trpc.workspace.upgradePlan.mutationOptions({
			onSuccess: url => {
				if (url) {
					window.location.href = url;
				}
			},
			onError: error => {
				console.error('Error upgrading plan:', error);
			},
		}),
	);

	// Handle upgrade click
	const handleUpgradeClick = (planId: PlanType) => {
		if (planId === currentPlan) return;

		upgradePlan({
			handle: workspace.handle,
			planId: planId,
			billingCycle: billingPeriod,
		});
	};

	return (
		<div className='flex-1 overflow-y-auto'>
			<div className='container mx-auto py-8'>
				{/* Header */}
				<div className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Simple, transparent pricing for invoicing
					</H>
					<Text variant='lg/normal' className='text-muted-foreground'>
						Start with 3 free invoices per month. Upgrade for unlimited invoices and
						professional features.
					</Text>
				</div>

				{/* Billing Toggle */}
				<div className='mb-8 flex justify-center'>
					<div className='flex items-center rounded-lg border bg-background p-1'>
						<button
							onClick={() => setParams({ billing: 'monthly' })}
							className={cn(
								'rounded-md px-4 py-2 text-sm font-medium transition-all',
								params.billing === 'monthly' ?
									'bg-primary text-primary-foreground shadow-sm'
								:	'text-muted-foreground hover:text-foreground',
							)}
						>
							Monthly
						</button>
						<button
							onClick={() => setParams({ billing: 'yearly' })}
							className={cn(
								'rounded-md px-4 py-2 text-sm font-medium transition-all',
								params.billing === 'yearly' ?
									'bg-primary text-primary-foreground shadow-sm'
								:	'text-muted-foreground hover:text-foreground',
							)}
						>
							Yearly
							<span className='ml-1 text-xs'>(save 17%)</span>
						</button>
					</div>
				</div>

				{/* Pricing Cards */}
				<div className='mb-12 grid gap-6 lg:grid-cols-2 lg:px-24'>
					{/* Free Plan */}
					{freePlan && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Card
								className={cn(
									'relative flex h-full flex-col p-6',
									isCurrentPlan('free') && 'border-black',
								)}
							>
								{isCurrentPlan('free') && (
									<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
										<span className='rounded-full bg-black px-3 py-1 text-xs font-medium text-white'>
											Current Plan
										</span>
									</div>
								)}

								{/* Plan Name & Price */}
								<div className='mb-6 text-center'>
									<H size='4' className='mb-2'>
										Free
									</H>
									<div className='mb-2'>
										<span className='text-2xl font-bold'>$0</span>
										<span className='text-muted-foreground'>/mo</span>
									</div>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Forever free
									</Text>
								</div>

								{/* Description */}
								<Text
									variant='sm/normal'
									className='mb-6 text-center text-muted-foreground'
								>
									Perfect for trying out invoicing or occasional use
								</Text>

								{/* CTA Button */}
								<Button
									onClick={() => handleUpgradeClick('free')}
									look='secondary'
									className='mb-6 w-full'
									disabled={isCurrentPlan('free') || isPending}
								>
									{isCurrentPlan('free') ?
										'Current Plan'
									: isPending ?
										'Processing...'
									:	'Downgrade'}
								</Button>

								{/* Features */}
								<div className='space-y-3'>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>3 invoices per month</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>10 clients</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>Basic template</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>7-day payment tracking</Text>
									</div>
									<div className='flex items-start gap-2'>
										<X className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
										<Text
											variant='sm/normal'
											className='text-muted-foreground line-through'
										>
											Recurring billing
										</Text>
									</div>
									<div className='flex items-start gap-2'>
										<X className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
										<Text
											variant='sm/normal'
											className='text-muted-foreground line-through'
										>
											Custom branding
										</Text>
									</div>
									<div className='flex items-start gap-2'>
										<X className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
										<Text
											variant='sm/normal'
											className='text-muted-foreground line-through'
										>
											Automated reminders
										</Text>
									</div>
								</div>
							</Card>
						</motion.div>
					)}

					{/* Pro Plan */}
					{proPlan && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<Card
								className={cn(
									'relative flex h-full flex-col p-6',
									!isCurrentPlan('free') && 'border-primary shadow-lg',
									isCurrentPlan('invoice.pro') && 'border-black',
								)}
							>
								{isCurrentPlan('invoice.pro') ?
									<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
										<span className='rounded-full bg-black px-3 py-1 text-xs font-medium text-white'>
											Current Plan
										</span>
									</div>
								: !isCurrentPlan('free') ?
									null
								:	<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
										<span className='flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'>
											<Sparkles className='h-3 w-3' />
											Recommended
										</span>
									</div>
								}

								{/* Plan Name & Price */}
								<div className='mb-6 text-center'>
									<H size='4' className='mb-2'>
										Invoice Pro
									</H>
									<div className='mb-2'>
										<span className='text-2xl font-bold'>
											${getPriceDisplay(proPlan)}
										</span>
										<span className='text-muted-foreground'>/mo</span>
									</div>
									{billingPeriod === 'yearly' && (
										<Text variant='sm/normal' className='text-muted-foreground'>
											billed yearly
										</Text>
									)}
								</div>

								{/* Description */}
								<Text
									variant='sm/normal'
									className='mb-6 text-center text-muted-foreground'
								>
									Professional invoicing with recurring billing
								</Text>

								{/* CTA Button */}
								<Button
									onClick={() => handleUpgradeClick('invoice.pro')}
									look={isCurrentPlan('free') ? 'primary' : 'secondary'}
									className='mb-6 w-full'
									disabled={isCurrentPlan('invoice.pro') || isPending}
								>
									{isCurrentPlan('invoice.pro') ?
										'Current Plan'
									: isPending ?
										'Processing...'
									: isCurrentPlan('free') ?
										'Upgrade'
									:	'Switch Plan'}
								</Button>

								{/* Features */}
								<div className='space-y-3'>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal' className='font-medium'>
											Unlimited invoices
										</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal' className='font-medium'>
											Unlimited clients
										</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal' className='font-medium'>
											Recurring billing
										</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>Custom branding</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>Premium templates</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>Automated reminders</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>30-day payment tracking</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>0.5% transaction fee</Text>
									</div>
									<div className='flex items-start gap-2'>
										<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
										<Text variant='sm/normal'>Priority support</Text>
									</div>
								</div>
							</Card>
						</motion.div>
					)}
				</div>

				{/* Comparison Table */}
				<div className='mt-16'>
					<H size='2' className='mb-8 text-center'>
						Feature Comparison
					</H>

					<div className='overflow-x-auto rounded-lg border'>
						<table className='w-full'>
							<thead>
								<tr className='border-b bg-muted/50'>
									<th className='p-4 text-left font-medium'>Feature</th>
									<th className='p-4 text-center font-medium'>Free</th>
									<th className='p-4 text-center font-medium'>Invoice Pro</th>
								</tr>
							</thead>
							<tbody>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Invoices per month</td>
									<td className='p-4 text-center'>3</td>
									<td className='p-4 text-center'>Unlimited</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Client limit</td>
									<td className='p-4 text-center'>10</td>
									<td className='p-4 text-center'>Unlimited</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Recurring billing</td>
									<td className='p-4 text-center'>
										<X className='mx-auto h-4 w-4 text-muted-foreground' />
									</td>
									<td className='p-4 text-center'>
										<Check className='mx-auto h-4 w-4 text-green-500' />
									</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Custom branding</td>
									<td className='p-4 text-center'>
										<X className='mx-auto h-4 w-4 text-muted-foreground' />
									</td>
									<td className='p-4 text-center'>
										<Check className='mx-auto h-4 w-4 text-green-500' />
									</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Templates</td>
									<td className='p-4 text-center'>Basic</td>
									<td className='p-4 text-center'>Premium (5+)</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Payment reminders</td>
									<td className='p-4 text-center'>Manual</td>
									<td className='p-4 text-center'>Automated</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Payment tracking</td>
									<td className='p-4 text-center'>7 days</td>
									<td className='p-4 text-center'>30 days</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Transaction fee</td>
									<td className='p-4 text-center'>—</td>
									<td className='p-4 text-center'>0.5%</td>
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Support</td>
									<td className='p-4 text-center'>Basic</td>
									<td className='p-4 text-center'>Priority</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
