'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { EMAIL_TEMPLATE_VARIABLES } from '@barely/lib/server/routes/email-template/email-template.constants';
import { upsertEmailTemplateSchema } from '@barely/lib/server/routes/email-template/email-template.schema';

import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useEmailTemplateContext } from './email-template-context';

export function CreateOrUpdateEmailTemplateModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const apiUtils = api.useUtils();

	const {
		lastSelectedEmailTemplate: selectedEmailTemplate,
		showCreateEmailTemplateModal,
		showUpdateEmailTemplateModal,
		setShowCreateEmailTemplateModal,
		setShowUpdateEmailTemplateModal,
		focusGridList,
	} = useEmailTemplateContext();

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

	const { mutateAsync: createEmailTemplate } = api.emailTemplate.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateEmailTemplate } = api.emailTemplate.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : selectedEmailTemplate ?? null,
		upsertSchema: upsertEmailTemplateSchema,
		// mode === 'create' ? createEmailTemplateSchema : updateEmailTemplateSchema,
		defaultValues: {
			name: mode === 'update' ? selectedEmailTemplate?.name ?? '' : '',
			subject: mode === 'update' ? selectedEmailTemplate?.subject ?? '' : '',
			body: mode === 'update' ? selectedEmailTemplate?.body ?? '' : '',
			fromId: mode === 'update' ? selectedEmailTemplate?.fromId ?? '' : '',
		},
		handleCreateItem: async d => {
			d.fromId;
			await createEmailTemplate(d);
		},
		handleUpdateItem: async d => {
			await updateEmailTemplate(d);
		},
	});

	const showEmailTemplateModal =
		mode === 'create' ? showCreateEmailTemplateModal : showUpdateEmailTemplateModal;
	const setShowEmailTemplateModal =
		mode === 'create' ? setShowCreateEmailTemplateModal : setShowUpdateEmailTemplateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailTemplate.invalidate();
		form.reset();
		setShowEmailTemplateModal(false);
	}, [form, focusGridList, apiUtils.emailTemplate, setShowEmailTemplateModal]);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showEmailTemplateModal}
			setShowModal={setShowEmailTemplateModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='email'
				title={
					mode === 'update' ?
						`Update ${selectedEmailTemplate?.name ?? ''}`
					:	'Create Email Template'
				}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					<TextField
						label='Name'
						name='name'
						control={form.control}
						infoTooltip='The name of the email template. This is just for your reference.'
					/>
					<SelectField
						label='From'
						name='fromId'
						control={form.control}
						options={emailAddressOptions ?? []}
					/>
					<TextField label='Subject' name='subject' control={form.control} />

					<Label>Body</Label>
					<MDXEditor
						variables={EMAIL_TEMPLATE_VARIABLES}
						markdown={form.getValues('body') ?? ''}
						onChange={markdown => {
							form.setValue('body', markdown);
						}}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth disabled={submitDisabled}>
						{mode === 'update' ? 'Save Email Template' : 'Create Email Template'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
