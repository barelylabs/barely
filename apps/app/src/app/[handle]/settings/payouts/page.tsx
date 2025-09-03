'use client';

import type { z } from 'zod/v4';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUpdateWorkspace, useWorkspaceWithAll, useZodForm } from '@barely/hooks';
import { getFeePercentageForCheckout } from '@barely/lib/utils/cart';
import { isProduction } from '@barely/utils';
import { updateWorkspaceSchema } from '@barely/validators';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { SelectField } from '@barely/ui/forms/select-field';
import { Icon } from '@barely/ui/icon';
import { H, InlineCode, Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function PayoutsSettingsPage() {
	const trpc = useTRPC();
	const workspace = useWorkspaceWithAll();
	const params = useParams();

	const needsOnboarding =
		isProduction() ?
			!workspace.stripeConnectChargesEnabled
		:	!workspace.stripeConnectChargesEnabled_devMode;

	const { mutateAsync: startOnboarding } = useMutation(
		trpc.stripeConnect.getOnboardingLink.mutationOptions({
			onSuccess: url => {
				if (!url) return;
				window.location.href = url;
			},
		}),
	);

	useEffect(() => {
		if (params.refreshOnboarding && needsOnboarding) {
			startOnboarding({
				handle: workspace.handle,
				callbackPath: `${workspace.handle}/settings/payouts`,
			}).catch(console.error);
		}
	}, [workspace.handle, params.refreshOnboarding, startOnboarding, needsOnboarding]);

	const stripeConnectAccountId =
		isProduction() ?
			workspace.stripeConnectAccountId
		:	workspace.stripeConnectAccountId_devMode;

	const cartFee = getFeePercentageForCheckout(workspace);

	return (
		<>
			<DashContentHeader
				title='Payouts'
				subtitle='Barely uses Stripe to securely process payouts.'
			/>
			<DashContent>
				<Card>
					<div className='flex flex-row items-center gap-2'>
						{/* <Icon.stripe className='h-10 w-10' /> */}
						<H size='5'>Stripe Connect</H>
					</div>
					{needsOnboarding ?
						<>
							<Button
								onClick={() =>
									startOnboarding({
										handle: workspace.handle,
										callbackPath: `${workspace.handle}/settings/payouts`,
									})
								}
							>
								Start Onboarding
							</Button>
						</>
					:	<div className='flex flex-col gap-2'>
							<div className='w-fit rounded-md bg-slate-100 p-2'>
								<InlineCode>
									{stripeConnectAccountId?.replace(/^acct_/, '') ?? 'N/A'}
								</InlineCode>
							</div>
							<Text variant='sm/normal' className='italic'>
								Your Stripe Connect account is connected and ready to receive payouts.
							</Text>
						</div>
					}
					<Text variant='sm/normal' className='mt-2' muted>
						<span className='font-bold'>Cart fee:</span>
						{` ${cartFee}% + Stripe fees, taken at the time of purchase.`}
					</Text>
				</Card>
				<WorkspaceCurrencyForm />
			</DashContent>
		</>
	);
}

export function WorkspaceCurrencyForm() {
	const workspace = useWorkspaceWithAll();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			currency: workspace.currency,
		},
		resetOptions: { keepDirtyValues: true },
	});
	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace({ ...data, handle: workspace.handle });
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Currency'
			subtitle='The currency your merch and invoices are priced in.'
		>
			<SelectField
				label='Currency'
				control={form.control}
				name='currency'
				options={[
					{
						label: (
							<div className='flex flex-row items-center gap-1'>
								<Icon.usd className='h-3 w-3' />
								USD
							</div>
						),
						value: 'usd',
					},
					{
						label: (
							<div className='flex flex-row items-center gap-1'>
								<Icon.gbp className='h-3 w-3' />
								GBP
							</div>
						),
						value: 'gbp',
					},
				]}
			/>
		</SettingsCardForm>
	);
}
