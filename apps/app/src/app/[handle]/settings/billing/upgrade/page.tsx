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

export default function UpgradePage() {
	const { workspace } = useWorkspace();
	const trpc = useTRPC();
	const currentPlan = workspace.plan;

	// Determine default toggle positions based on current plan
	const isAgencyPlan = currentPlan.includes('.plus');

	// Use nuqs for URL state management
	const [params, setParams] = useQueryStates({
		type: parseAsStringEnum(['diy', 'agency']).withDefault(
			isAgencyPlan ? 'agency' : 'diy',
		),
		billing: parseAsStringEnum(['monthly', 'yearly']).withDefault('yearly'),
	});

	const showPlusPlans = params.type === 'agency';
	const billingPeriod = params.billing;

	// Explicitly define which plans to show for each toggle state
	const standardPlanIds = ['bedroom', 'rising', 'breakout'] as const;
	const plusPlanIds = ['bedroom.plus', 'rising.plus', 'breakout.plus'] as const;

	// Get the actual plan objects based on IDs
	const standardPlans = standardPlanIds
		.map(id => WORKSPACE_PLANS.get(id))
		.filter(Boolean);
	const plusPlans = plusPlanIds.map(id => WORKSPACE_PLANS.get(id)).filter(Boolean);
	const freePlan = WORKSPACE_PLANS.get('free');

	// Get the plans to display based on toggle
	const displayPlans = showPlusPlans ? plusPlans : standardPlans;

	// Helper to get price display
	const getPriceDisplay = (plan: NonNullable<(typeof standardPlans)[number]>) => {
		const price =
			billingPeriod === 'monthly' ?
				plan.price.monthly.amount
			:	Math.round(plan.price.yearly.amount / 12);
		return price;
	};

	// Helper to check if plan is current
	const isCurrentPlan = (planId: PlanType) => currentPlan === planId;

	// Helper to determine featured plan
	const getFeaturedPlan = () => {
		if (showPlusPlans) return 'rising.plus';
		return 'rising';
	};

	// Helper to determine if a plan is higher or lower than current
	const getPlanComparisonText = (planId: PlanType) => {
		if (isCurrentPlan(planId)) return 'Current';

		// Free plan is always a downgrade (unless you're already on it)
		if (planId === 'free') return 'Downgrade';

		// Check if we're comparing across plan types (DIY vs Agency)
		const currentIsAgency = currentPlan.includes('.plus');
		const targetIsAgency = planId.includes('.plus');

		// If current is Agency and target is DIY, it's always a downgrade
		if (currentIsAgency && !targetIsAgency) return 'Downgrade';

		// If current is DIY and target is Agency, it's always an upgrade
		if (!currentIsAgency && targetIsAgency) return 'Upgrade';

		// If both are same type, compare within that hierarchy
		const planHierarchy =
			targetIsAgency ?
				['bedroom.plus', 'rising.plus', 'breakout.plus']
			:	['free', 'bedroom', 'rising', 'breakout'];

		const currentIndex = planHierarchy.indexOf(currentPlan);
		const targetIndex = planHierarchy.indexOf(planId);

		// If we can't find the plans in the hierarchy, default to 'Upgrade'
		if (currentIndex === -1 || targetIndex === -1) return 'Upgrade';

		return targetIndex < currentIndex ? 'Downgrade' : 'Upgrade';
	};

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
				// You could add a toast notification here
			},
		}),
	);

	// Handle upgrade click
	const handleUpgradeClick = (planId: PlanType) => {
		if (planId === currentPlan) return; // Don't upgrade to current plan

		upgradePlan({
			handle: workspace.handle,
			planId,
			billingCycle: billingPeriod,
		});
	};

	return (
		<div className='flex-1 overflow-y-auto'>
			<div className='container mx-auto py-8'>
				{/* Header */}
				<div className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Flexible plans that grow with you
					</H>
					<Text variant='lg/normal' className='text-muted-foreground'>
						{params.type === 'agency' ?
							'Start for free, no credit card required. Upgrade for expert coaching and campaign management.'
						:	'Start for free, no credit card required. Upgrade when you need more capacity.'
						}
					</Text>
				</div>

				{/* Toggle Container */}
				<div className='mb-8 flex flex-col items-center gap-6 md:items-center lg:flex-row lg:items-end lg:justify-between'>
					{/* Plan Type Toggle */}
					<div className='flex items-center rounded-lg border bg-background p-1'>
						<button
							onClick={() => setParams({ type: 'diy' })}
							className={cn(
								'relative rounded-md px-8 py-3 text-sm font-medium transition-all',
								params.type === 'diy' ?
									'bg-primary text-primary-foreground shadow-sm'
								:	'text-muted-foreground hover:text-foreground',
							)}
						>
							<div className='flex flex-col items-center gap-1'>
								<span className='text-base font-semibold'>DIY</span>
								<span className='text-xs'>Access to tools</span>
							</div>
						</button>
						<button
							onClick={() => setParams({ type: 'agency' })}
							className={cn(
								'relative rounded-md px-8 py-3 text-sm font-medium transition-all',
								params.type === 'agency' ?
									'bg-primary text-primary-foreground shadow-sm'
								:	'text-muted-foreground hover:text-foreground',
							)}
						>
							<div className='flex flex-col items-center gap-1'>
								<span className='text-base font-semibold'>Agency</span>
								<span className='text-xs'>Tools + coaching</span>
							</div>
						</button>
					</div>

					{/* Billing Toggle */}
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
							<span className='ml-1 text-xs'>(2 months free)</span>
						</button>
					</div>
				</div>

				{/* Pricing Cards */}
				<div className='mb-12 grid gap-6 lg:grid-cols-3'>
					{displayPlans.map(plan => {
						if (!plan) return null;

						const featuredPlanId = getFeaturedPlan();
						const isFeatured = plan.id === featuredPlanId;
						const isCurrent = isCurrentPlan(plan.id);
						// Only show "Most Popular" if it's not a downgrade from current plan
						const showFeaturedBadge =
							isFeatured && getPlanComparisonText(featuredPlanId) !== 'Downgrade';

						return (
							<motion.div
								key={plan.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Card
									className={cn(
										'relative flex h-full flex-col p-6',
										showFeaturedBadge && 'border-primary shadow-lg',
										isCurrent && 'border-black',
									)}
								>
									{isCurrent ?
										<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
											<span className='rounded-full bg-black px-3 py-1 text-xs font-medium text-white'>
												Current Plan
											</span>
										</div>
									:	showFeaturedBadge && (
											<div className='absolute -top-3 left-1/2 -translate-x-1/2'>
												<span className='flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'>
													<Sparkles className='h-3 w-3' />
													Most Popular
												</span>
											</div>
										)
									}

									{/* Plan Name & Price */}
									<div className='mb-6 text-center'>
										<H size='4' className='mb-2'>
											{plan.name}
										</H>
										<div className='mb-2'>
											<span className='text-2xl font-bold'>${getPriceDisplay(plan)}</span>
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
										{plan.description}
									</Text>

									{/* CTA Button */}
									<Button
										onClick={() => handleUpgradeClick(plan.id)}
										look={showFeaturedBadge ? 'primary' : 'secondary'}
										className='mb-6 w-full'
										disabled={isCurrent || isPending}
									>
										{isCurrent ?
											'Current'
										: isPending ?
											'Processing...'
										:	getPlanComparisonText(plan.id)}
									</Button>

									{/* Features */}
									<div className='space-y-3'>
										{plan.highlights.map((highlight, idx) => (
											<div key={idx} className='flex items-start gap-2'>
												{highlight.disabled ?
													<X className='mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground' />
												:	<Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
												}
												<Text
													variant='sm/normal'
													className={cn(
														highlight.disabled && 'text-muted-foreground line-through',
													)}
												>
													{highlight.description}
												</Text>
											</div>
										))}
									</div>
								</Card>
							</motion.div>
						);
					})}
				</div>

				{/* Free Plan */}
				{freePlan && !showPlusPlans && (
					<Card className='mb-12 p-6'>
						<div className='flex flex-col items-center justify-between gap-4 lg:flex-row'>
							<div>
								<H size='3' className='mb-2'>
									{freePlan.name} Plan
								</H>
								<Text variant='md/normal' className='text-muted-foreground'>
									{freePlan.description}
								</Text>
							</div>
							<div className='flex items-center gap-4'>
								<Text variant='lg/semibold'>$0 forever</Text>
								<Button
									look='secondary'
									onClick={() => handleUpgradeClick('free')}
									disabled={isCurrentPlan('free') || isPending}
								>
									{isCurrentPlan('free') ?
										'Current Plan'
									: isPending ?
										'Processing...'
									:	getPlanComparisonText('free')}
								</Button>
							</div>
						</div>
					</Card>
				)}

				{/* Comparison Section */}
				<div className='mt-16'>
					<H size='2' className='mb-8 text-center'>
						Detailed Comparison
					</H>

					<div className='overflow-x-auto rounded-lg border'>
						<table className='w-full'>
							<thead>
								<tr className='border-b bg-muted/50'>
									<th className='p-4 text-left font-medium'>Feature</th>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<th key={plan.id} className='p-4 text-center font-medium'>
												{plan.name}
											</th>
										);
									})}
									{!showPlusPlans && freePlan && (
										<th className='p-4 text-center font-medium'>Free</th>
									)}
								</tr>
							</thead>
							<tbody>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Team Members</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.usageLimits.members === Number.MAX_SAFE_INTEGER ?
													'Unlimited'
												:	plan.usageLimits.members}
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>{freePlan.usageLimits.members}</td>
									)}
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Fan Database</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.usageLimits.fans === Number.MAX_SAFE_INTEGER ?
													'Unlimited'
												:	plan.usageLimits.fans.toLocaleString()}
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>
											{freePlan.usageLimits.fans.toLocaleString()}
										</td>
									)}
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Links/Month</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.usageLimits.newLinksPerMonth.toLocaleString()}
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>
											{freePlan.usageLimits.newLinksPerMonth}
										</td>
									)}
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Analytics Retention</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.analyticsRetentionDays === Number.MAX_SAFE_INTEGER ?
													'Lifetime'
												: plan.analyticsRetentionDays === 365 ?
													'1 year'
												: plan.analyticsRetentionDays === 365 * 3 ?
													'3 years'
												:	`${plan.analyticsRetentionDays} days`}
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>30 days</td>
									)}
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Merch Transaction Fee</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.cartFeePercentage}%
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>{freePlan.cartFeePercentage}%</td>
									)}
								</tr>
								<tr className='border-b'>
									<td className='p-4 font-medium'>Support</td>
									{displayPlans.map(plan => {
										if (!plan) return null;
										return (
											<td key={plan.id} className='p-4 text-center'>
												{plan.supportLevel === 'priority' ? 'Priority' : 'Basic'}
											</td>
										);
									})}
									{!showPlusPlans && freePlan && (
										<td className='p-4 text-center'>Basic</td>
									)}
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
