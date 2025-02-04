'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { EMAIL_TEMPLATE_VARIABLES } from '@barely/lib/server/routes/email-template/email-template.constants';
import { upsertEmailTemplateSchema } from '@barely/lib/server/routes/email-template/email-template.schema';

import { Icon } from '@barely/ui/elements/icon';
import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Separator } from '@barely/ui/elements/separator';
import { Switch } from '@barely/ui/elements/switch';
import { Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';

import { SendTestEmail } from '~/app/[handle]/_components/send-test-email';
import { useEmailTemplateContext } from './email-template-context';

export function CreateOrUpdateEmailTemplateModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const apiUtils = api.useUtils();
	const updateMode = mode === 'update';
	const createMode = mode === 'create';

	const {
		lastSelectedItem,
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
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
		updateItem: createMode ? null : lastSelectedItem ?? null,
		upsertSchema: upsertEmailTemplateSchema,
		defaultValues: {
			name: createMode ? '' : lastSelectedItem?.name ?? '',
			type: updateMode ? lastSelectedItem?.type ?? 'marketing' : 'marketing',
			subject: updateMode ? lastSelectedItem?.subject ?? '' : '',
			previewText: updateMode ? lastSelectedItem?.previewText ?? '' : '',
			body: updateMode ? lastSelectedItem?.body ?? '' : '',
			fromId: updateMode ? lastSelectedItem?.fromId ?? '' : '',
		},
		handleCreateItem: async d => {
			await createEmailTemplate(d);
		},
		handleUpdateItem: async d => {
			await updateEmailTemplate(d);
		},
	});

	const showEmailTemplateModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowEmailTemplateModal =
		mode === 'create' ? setShowCreateModal : setShowUpdateModal;

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
						`Update ${lastSelectedItem?.name ?? ''}`
					:	'Create Email Template'
				}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					<div className='mb-4 flex flex-row justify-end'>
						<SendTestEmail values={form.getValues()} />
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

					<Separator className='my-4' />

					<SelectField
						label='From'
						name='fromId'
						control={form.control}
						options={emailAddressOptions ?? []}
					/>
					<TextField label='Subject' name='subject' control={form.control} />
					<TextField label='Preview Text' name='previewText' control={form.control} />

					<Label>Body</Label>
					<MDXEditor
						variables={EMAIL_TEMPLATE_VARIABLES}
						markdown={form.getValues('body') ?? ''}
						onChange={markdown => {
							form.setValue('body', markdown, { shouldDirty: true });
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
