'use client';

import { useCallback, useMemo } from 'react';
import { EMAIL_TEMPLATE_VARIABLES } from '@barely/const';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { upsertEmailTemplateSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Separator } from '@barely/ui/separator';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

import { SendTestEmail } from '~/app/[handle]/_components/send-test-email';
import { useEmailTemplate, useEmailTemplateSearchParams } from './email-template-context';

export function CreateOrUpdateEmailTemplateModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const updateMode = mode === 'update';
	const createMode = mode === 'create';

	const { lastSelectedItem, focusGridList } = useEmailTemplate();

	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useEmailTemplateSearchParams();

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

	const { mutateAsync: createEmailTemplate } = useMutation(
		trpc.emailTemplate.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateEmailTemplate } = useMutation(
		trpc.emailTemplate.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem:
			createMode ? null
			: lastSelectedItem ?
				{
					...lastSelectedItem,
					replyTo: lastSelectedItem.replyTo ?? undefined,
					previewText: lastSelectedItem.previewText ?? undefined,
				}
			:	null,
		upsertSchema: upsertEmailTemplateSchema,
		defaultValues: {
			name: createMode ? '' : (lastSelectedItem?.name ?? ''),
			type: updateMode ? (lastSelectedItem?.type ?? 'marketing') : 'marketing',
			subject: updateMode ? (lastSelectedItem?.subject ?? '') : '',
			previewText: updateMode ? (lastSelectedItem?.previewText ?? '') : '',
			body: updateMode ? (lastSelectedItem?.body ?? '') : '',
			fromId: updateMode ? (lastSelectedItem?.fromId ?? '') : '',
		},
		handleCreateItem: async d => {
			await createEmailTemplate({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateEmailTemplate({
				...d,
				handle,
			});
		},
	});

	const showEmailTemplateModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowEmailTemplateModal = useMemo(
		() =>
			mode === 'create' ?
				(value: boolean) => void setShowCreateModal(value)
			:	(value: boolean) => void setShowUpdateModal(value),
		[mode, setShowCreateModal, setShowUpdateModal],
	);

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(trpc.emailTemplate.byWorkspace.pathFilter());
		form.reset();
		setShowEmailTemplateModal(false);
	}, [form, focusGridList, queryClient, trpc.emailTemplate, setShowEmailTemplateModal]);

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

					<Separator className='my-4' />

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
						markdown={form.getValues('body')}
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
