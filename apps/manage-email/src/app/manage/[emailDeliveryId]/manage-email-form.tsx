'use client';

import { useState } from 'react';
import { emailManageApi } from '@barely/lib/server/routes/email-manage/email-manage.api.react';

import { Button } from '@barely/ui/elements/button';
import { ConfettiBurst } from '@barely/ui/elements/confetti';
import { Text } from '@barely/ui/elements/typography';

import { useToast } from '../../../../../../packages/toast';

export function ManageEmailForm({
	emailDeliveryId,
	initialEmailMarketingOptIn,
	justUnsubscribed,
}: {
	emailDeliveryId: string;
	initialEmailMarketingOptIn: boolean;
	justUnsubscribed?: boolean;
}) {
	const { toast } = useToast();

	// const [justUnsubbed, setJustUnsubbed] = useState(justUnsubscribed);

	// useEffect(() => {
	// 	if (toast && justUnsubbed) {
	// 		console.log('justUnsubbed', justUnsubbed);
	// 		toast.success('You have been unsubscribed from marketing emails');
	// 		setJustUnsubbed(false);
	// 	}
	// }, [justUnsubbed, toast]);

	const [emailMarketingOptIn, setEmailMarketingOptIn] = useState(
		initialEmailMarketingOptIn,
	);

	const { mutate, isPending } = emailManageApi.toggleEmailMarketingOptIn.useMutation({
		onSuccess: data => {
			setEmailMarketingOptIn(data.newEmailMarketingOptIn);
			if (data.newEmailMarketingOptIn) {
				toast.success('You have been resubscribed to marketing emails');
			} else {
				toast.success('You have been unsubscribed from marketing emails');
			}
		},
	});

	const buttonText =
		emailMarketingOptIn && !isPending ? 'Unsubscribe From Marketing Emails'
		: emailMarketingOptIn && isPending ? 'Unsubscribing...'
		: !emailMarketingOptIn && isPending ? 'Subscribing...'
		: 'Resubscribe To Marketing Emails';

	return (
		<div className='flex w-full flex-col gap-4'>
			{justUnsubscribed && !emailMarketingOptIn && (
				<Text className='text-center'>
					👋 you have been unsubscribed from marketing emails
				</Text>
			)}
			<div className='mx-auto'>
				<ConfettiBurst active={emailMarketingOptIn} />
			</div>
			<Button
				loading={isPending}
				look={emailMarketingOptIn ? 'outline' : 'primary'}
				onClick={() => {
					mutate({ emailDeliveryId });
				}}
			>
				{buttonText}
			</Button>
		</div>
	);
}
