import type { emailTemplateForm_sendEmailSchema } from '@barely/lib/server/routes/email-template/email-template.schema';
import type { flowForm_sendEmailSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useState } from 'react';
import { useToast } from '@barely/lib/hooks/use-toast';
import { api } from '@barely/lib/server/api/react';
import { z } from 'zod';

import { Button } from '@barely/ui/elements/button';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { TextField } from '@barely/ui/forms/text-field';

export function SendTestEmail({
	values,
}: {
	values:
		| z.infer<typeof flowForm_sendEmailSchema>
		| z.infer<typeof emailTemplateForm_sendEmailSchema>;
}) {
	const { toast } = useToast();

	const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
	const [sendTestEmailTo, setSendTestEmailTo] = useState('');
	const [sending, setSending] = useState(false);

	const { mutate: sendTestEmail } = api.emailTemplate.sendTestEmail.useMutation({
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
	});

	const handleSendTestEmail = () => {
		if (!values.sendTestEmailTo) return;

		let to: string = sendTestEmailTo;

		try {
			to = z.string().email().parse(sendTestEmailTo);
		} catch (error) {
			toast('Invalid email address', {
				description: 'Please enter a valid email address',
			});
			return;
		}

		sendTestEmail({
			to,
			fromId: values.fromId,
			subject: values.subject,
			previewText: values.previewText,
			body: values.body,
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
