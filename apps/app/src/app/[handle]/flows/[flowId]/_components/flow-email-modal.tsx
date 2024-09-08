'use client';

import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod';
import { useState } from 'react';
import { useToast } from '@barely/lib/hooks/use-toast';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { EMAIL_TEMPLATE_VARIABLES } from '@barely/lib/server/routes/email-template/email-template.constants';
import { flowForm_sendEmailSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { Separator } from '@barely/ui/elements/separator';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useFlowStore } from './flow-store';

export type FlowEmailData = z.infer<typeof flowForm_sendEmailSchema>;

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateEmailNode: state.updateSendEmailNode,
	showSendEmailModal: state.showEmailModal,
	setShowSendEmailModal: state.setShowEmailModal,
});

export const FlowEmailModal = () => {
	const { toast } = useToast();
	const { showSendEmailModal, setShowSendEmailModal, currentNode, updateEmailNode } =
		useFlowStore(useShallow(selector));

	const currentEmailNode = currentNode?.type === 'sendEmail' ? currentNode : null;

	const { handle } = useWorkspace();

	const { data: emailAddressOptions } = api.emailAddress.byWorkspace.useQuery(
		{ handle },
		{
			select: data =>
				data.emailAddresses.map(email => ({
					label: email.email,
					value: email.id,
				})),
		},
	);

	/* form */

	const form = useZodForm({
		schema: flowForm_sendEmailSchema,
		values: currentEmailNode?.data,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const handleSubmit = (data: z.infer<typeof flowForm_sendEmailSchema>) => {
		console.log(data);
		setShowSendEmailModal(false);
		updateEmailNode(currentEmailNode?.id ?? '', data);
		form.reset();
	};

	const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
	const { mutate: sendTestEmail } = api.emailTemplate.sendTestEmail.useMutation({
		onSuccess: () => {
			toast('Test email sent', {
				description: `Check ${form.getValues('sendTestEmailTo')} for the test email`,
			});
			setIsTestEmailModalOpen(false);
		},
	});

	const handleSendTestEmail = () => {
		const currentValues = form.getValues();
		if (!currentValues.sendTestEmailTo) return;
		sendTestEmail({
			to: currentValues.sendTestEmailTo,
			fromId: currentValues.fromId,
			subject: currentValues.subject,
			body: currentValues.body,
			variables: {}, // Add variables if needed
		});
	};

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showSendEmailModal}
			setShowModal={setShowSendEmailModal}
			preventDefaultClose={preventDefaultClose}
		>
			<ModalHeader icon='email' title='Edit Email' />

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='mb-4 flex flex-row justify-end'>
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
										control={form.control}
										label='Recipient'
										name='sendTestEmailTo'
										placeholder='Enter email address'
									/>
									<Button onClick={handleSendTestEmail} fullWidth>
										Send
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<SelectField
						label='From'
						name='fromId'
						control={form.control}
						options={emailAddressOptions ?? []}
					/>

					<Separator className='mt-4' />
					<TextField
						label='Name'
						name='name'
						control={form.control}
						infoTooltip='The name of the email template. This is just for your reference.'
					/>
					{/* <TextField
						label='Reply To'
						name='replyTo'
						control={form.control}
						infoTooltip='The email address to reply to'
					/> */}
					<TextField label='Subject' name='subject' control={form.control} />

					<Label>Body</Label>
					<MDXEditor
						variables={EMAIL_TEMPLATE_VARIABLES}
						markdown={currentEmailNode?.data.body ?? ''}
						onChange={markdown => {
							form.setValue('body', markdown);
						}}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Update</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
};
