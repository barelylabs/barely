'use client';

import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { EMAIL_TEMPLATE_VARIABLES } from '@barely/const';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { flowForm_sendEmailSchema } from '@barely/validators';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Separator } from '@barely/ui/separator';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

import { SendTestEmail } from '~/app/[handle]/_components/send-test-email';
import { useFlowStore } from './flow-store';

export type FlowEmailData = z.infer<typeof flowForm_sendEmailSchema>;

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateEmailNode: state.updateSendEmailNode,
	showSendEmailModal: state.showEmailModal,
	setShowSendEmailModal: state.setShowEmailModal,
});

export const FlowEmailModal = () => {
	// const { toast } = useToast();
	const { showSendEmailModal, setShowSendEmailModal, currentNode, updateEmailNode } =
		useFlowStore(useShallow(selector));

	const currentEmailNode = currentNode?.type === 'sendEmail' ? currentNode : null;

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: emailAddressOptions } = useSuspenseQuery(
		trpc.emailAddress.byWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data.emailAddresses.map(email => ({
						label: email.email,
						value: email.id,
					})),
			},
		),
	);

	/* form */
	const form = useZodForm({
		schema: flowForm_sendEmailSchema,
		values:
			currentEmailNode ?
				{
					...currentEmailNode.data,
					previewText: currentEmailNode.data.previewText ?? '',
				}
			:	undefined,
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
						<SendTestEmail
							values={{
								...form.getValues(),
								previewText: form.getValues('previewText') ?? '',
								replyTo: form.getValues('replyTo') ?? '',
							}}
						/>
					</div>

					<TextField
						label='Name'
						name='name'
						control={form.control}
						infoTooltip='The name of the email template. This is just for your reference.'
					/>
					<div className='flex flex-row items-center gap-3'>
						<Label>Type</Label>
						<Switch
							size='sm'
							checked={form.watch('type') === 'marketing'}
							onCheckedChange={c => {
								if (c) return form.setValue('type', 'marketing');
								return form.setValue('type', 'transactional');
							}}
						/>
						<Text>
							{form.watch('type') === 'marketing' ?
								<div className='flex flex-row items-center gap-2'>
									<Icon.marketing className='h-4 w-4' />
									Marketing
								</div>
							:	<div className='flex flex-row items-center gap-1'>
									<Icon.transactional className='h-4 w-4' />
									Transactional
								</div>
							}
						</Text>
					</div>

					{currentEmailNode?.data.flowOnly && (
						<div className='flex flex-row items-center gap-3'>
							<SwitchField label='Flow Only' name='flowOnly' control={form.control} />
						</div>
					)}

					<Separator className='mt-4' />
					<SelectField
						label='From'
						name='fromId'
						control={form.control}
						options={emailAddressOptions}
					/>
					<TextField label='Subject' name='subject' control={form.control} />
					<TextField label='Preview Text' name='previewText' control={form.control} />

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
