'use client';

import { useState } from 'react';
import { atomWithToggle } from '@barely/atoms';
import { WORKSPACE_PLANS } from '@barely/const';
import { useWorkspace } from '@barely/hooks';
import { toTitleCase } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { FeatureChecklist } from '@barely/ui/components/feature-checklist';
import { ConfettiBurst } from '@barely/ui/confetti';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

export const showUpgradeModalAtom = atomWithToggle(false);

export function UpgradeModal(props: {
	checkoutSuccessPath?: string;
	checkoutCancelPath?: string;
}) {
	const trpc = useTRPC();
	const { workspace } = useWorkspace();

	const [showUpgradeModal, setShowUpgradeModal] = useAtom(showUpgradeModalAtom);

	const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
	const [creatingCheckout, setCreatingCheckout] = useState(false);

	const { mutate: createUpgradeCheckoutLink } = useMutation({
		...trpc.workspaceStripe.createCheckoutLink.mutationOptions(),
		onSuccess: checkoutLink => {
			if (checkoutLink) window.location.replace(checkoutLink);
		},
		onError: () => setCreatingCheckout(false),
	});

	const triggerUpgradeCheckout = () => {
		setCreatingCheckout(true);
		createUpgradeCheckoutLink({
			handle: workspace.handle,
			planId: 'pro',
			billingCycle,
			successPath:
				props.checkoutSuccessPath ?
					`${workspace.handle}/${props.checkoutSuccessPath}`
				:	undefined,
			cancelPath:
				props.checkoutCancelPath ?
					`${workspace.handle}/${props.checkoutCancelPath}`
				:	undefined,
		});
	};

	const pro = WORKSPACE_PLANS.get('pro');
	if (!pro) return null;

	const cost =
		billingCycle === 'monthly' ? pro.price.monthly.amount : pro.price.yearly.amount;

	return (
		<Modal
			showModal={showUpgradeModal}
			setShowModal={setShowUpgradeModal}
			className='max-h-fit max-w-lg'
		>
			<ModalHeader
				icon='logo'
				title='Upgrade to Pro'
				subtitle='Enjoy higher limits and extra features with our Pro plan.'
			/>
			<ModalBody className=''>
				<div className='flex flex-row items-center justify-between'>
					<Text variant='lg/semibold'>
						Pro {toTitleCase(billingCycle)}{' '}
						<Badge variant='outline'>{`$${cost}/${billingCycle.replace(
							'ly',
							'',
						)}`}</Badge>
					</Text>
					<ConfettiBurst active={billingCycle === 'yearly'} />
					<Button
						look='link'
						size='xs'
						onClick={() =>
							setBillingCycle(billingCycle === 'yearly' ? 'monthly' : 'yearly')
						}
						className='underline'
					>
						{billingCycle === 'yearly' ? 'Switch to monthly' : 'Get 2 months free 🎁'}
					</Button>
				</div>

				<FeatureChecklist
					items={['Track 50x more link clicks per month', 'Access remarketing pixels']}
				/>

				<Button
					fullWidth
					className='mt-10'
					onClick={triggerUpgradeCheckout}
					loading={creatingCheckout}
				>
					Upgrade to Pro {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
				</Button>
			</ModalBody>
		</Modal>
	);
}
