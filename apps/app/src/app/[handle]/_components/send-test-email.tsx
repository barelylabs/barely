import type {
	emailTemplateForm_sendEmailSchema,
	flowForm_sendEmailSchema,
} from '@barely/validators';
import { useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useToast } from '@barely/toast';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { TextField } from '@barely/ui/forms/text-field';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';

export function SendTestEmail({
	values,
}: {
	values:
		| Pick<
				z.infer<typeof flowForm_sendEmailSchema>,
				'sendTestEmailTo' | 'fromId' | 'subject' | 'previewText' | 'body' | 'replyTo'
		  >
		| Pick<
				z.infer<typeof emailTemplateForm_sendEmailSchema>,
				'sendTestEmailTo' | 'fromId' | 'subject' | 'previewText' | 'body' | 'replyTo'
		  >;
}) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { toast } = useToast();

	const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
	const [sendTestEmailTo, setSendTestEmailTo] = useState('');
	const [sending, setSending] = useState(false);

	const { mutate: sendTestEmail } = useMutation(
		trpc.emailTemplate.sendTestEmail.mutationOptions({
			onMutate: () => {
				setSending(true);
			},
			onSuccess: () => {
				toast('Test email sent', {
					description: `Check ${sendTestEmailTo} for the test email`,
				});
				setSending(false);
				setIsTestEmailModalOpen(false);
			},
			onError: () => {
				setSending(false);
			},
		}),
	);

	const handleSendTestEmail = () => {
		if (!values.sendTestEmailTo) return;

		let to: string = sendTestEmailTo;

		try {
			to = z.email().parse(sendTestEmailTo);
		} catch {
			toast('Invalid email address', {
				description: 'Please enter a valid email address',
			});
			return;
		}

		sendTestEmail({
			handle,
			to,
			fromId: values.fromId,
			subject: values.subject,
			previewText: values.previewText,
			body: values.body,
			replyTo: values.replyTo,
			variables: {}, // Add variables if needed
		});
	};

	return (
		<Popover open={isTestEmailModalOpen} onOpenChange={setIsTestEmailModalOpen}>
			<PopoverTrigger asChild>
				<Button look='outline' size='sm'>
					Send Test Email
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80'>
				<div className='space-y-4'>
					<h4 className='font-medium leading-none'>Send Test Email</h4>
					<TextField
						// control={form.control}
						label='Recipient'
						name='sendTestEmailTo'
						placeholder='Enter email address'
						value={sendTestEmailTo}
						onChange={e => setSendTestEmailTo(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								handleSendTestEmail();
							}
						}}
					/>
					<Button
						onClick={handleSendTestEmail}
						fullWidth
						loading={sending}
						loadingText='Sending...'
					>
						Send
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
