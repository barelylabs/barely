'use client';

import { useState } from 'react';
import { useEmailManageTRPC } from '@barely/api/public/email-manage.trpc.react';
import { useToast } from '@barely/toast';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@barely/ui/button';
import { ConfettiBurst } from '@barely/ui/confetti';
import { Text } from '@barely/ui/typography';

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

	const trpc = useEmailManageTRPC();

	const [emailMarketingOptIn, setEmailMarketingOptIn] = useState(
		initialEmailMarketingOptIn,
	);

	const { mutate, isPending } = useMutation({
		...trpc.toggleEmailMarketingOptIn.mutationOptions({
			onSuccess: (data) => {
				setEmailMarketingOptIn(data.newEmailMarketingOptIn);
				if (data.newEmailMarketingOptIn) {
					toast.success('You have been resubscribed to marketing emails');
				} else {
					toast.success('You have been unsubscribed from marketing emails');
				}
			},
		}),
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
