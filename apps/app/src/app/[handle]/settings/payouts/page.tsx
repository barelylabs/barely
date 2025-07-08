'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceWithAll } from '@barely/hooks';
import { isProduction } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { InlineCode, Text } from '@barely/ui/typography';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function PayoutsSettingsPage() {
	const trpc = useTRPC();
	const workspace = useWorkspaceWithAll();
	const params = useParams();

	const needsOnboarding =
		isProduction() ?
			!workspace.stripeConnectChargesEnabled
		:	!workspace.stripeConnectChargesEnabled_devMode;

	const { mutateAsync: startOnboarding } = useMutation({
		...trpc.stripeConnect.getOnboardingLink.mutationOptions(),
		onSuccess: url => {
			if (!url) return;
			window.location.href = url;
		},
	});

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

	return (
		<>
			<DashContentHeader title='Payouts' subtitle='We use Stripe to process payouts.' />
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
					<Text variant='md/semibold'>Stripe Connect</Text>
					<div className='w-fit rounded-md bg-slate-100 p-2'>
						<InlineCode>
							{stripeConnectAccountId?.replace(/^acct_/, '') ?? 'N/A'}
						</InlineCode>
					</div>
					<Text variant='sm/normal'>
						Your Stripe Connect account is connected and ready to receive payouts.
					</Text>
				</div>
			}
		</>
	);
}
