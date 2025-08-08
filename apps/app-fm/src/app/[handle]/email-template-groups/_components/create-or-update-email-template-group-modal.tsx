'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { upsertEmailTemplateGroupSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useFieldArray } from 'react-hook-form';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Combobox } from '@barely/ui/combobox';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Label } from '@barely/ui/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

import {
	useEmailTemplateGroup,
	useEmailTemplateGroupSearchParams,
} from './email-template-group-context';

export function CreateOrUpdateEmailTemplateGroupModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { lastSelectedItem, focusGridList } = useEmailTemplateGroup();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useEmailTemplateGroupSearchParams();

	const { handle } = useWorkspace();

	const { data: selectedEmailTemplates } = useSuspenseQuery(
		trpc.emailTemplateGroup.byId.queryOptions(
			{
				handle,
				id: lastSelectedItem?.id ?? '',
			},
			{ select: data => data.emailTemplates },
		),
	);

	const { data: emailTemplateOptions } = useSuspenseQuery(
		trpc.emailTemplate.byWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data.emailTemplates.map(et => ({
						id: et.id,
						name: et.name,
						description: et.description ?? '',
						// lexorank: et.lexorank,
					})),
			},
		),
	);

	const { mutateAsync: createEmailTemplateGroup } = useMutation({
		...trpc.emailTemplateGroup.create.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateEmailTemplateGroup } = useMutation({
		...trpc.emailTemplateGroup.update.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem:
			mode === 'create' ? null
			: lastSelectedItem ?
				{
					...lastSelectedItem,
					emailTemplates: selectedEmailTemplates,
				}
			:	null,
		upsertSchema: upsertEmailTemplateGroupSchema,
		// mode === 'create' ? createEmailTemplateGroupSchema : updateEmailTemplateGroupSchema,
		defaultValues: {
			name: mode === 'update' ? (lastSelectedItem?.name ?? '') : '',
			description: mode === 'update' ? (lastSelectedItem?.description ?? '') : '',
			emailTemplates: mode === 'update' ? selectedEmailTemplates : [],
		},

		handleCreateItem: async d => {
			await createEmailTemplateGroup({
				...d,
				name: d.name,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateEmailTemplateGroup({
				...d,
				handle,
			});
		},
	});

	// emailTemplates array
	const {
		fields: emailTemplateFields,
		append: appendEmailTemplate,
		remove: removeEmailTemplate,
		move: moveEmailTemplate,
	} = useFieldArray({
		control: form.control,
		name: 'emailTemplates',
	});

	const handleSelectEmailTemplate = useCallback(
		(emailTemplate: NonNullable<typeof emailTemplateOptions>[number]) => {
			appendEmailTemplate(emailTemplate);
		},
		[appendEmailTemplate],
	);

	const activeEmailTemplates = form.watch('emailTemplates');
	const availableEmailTemplates = emailTemplateOptions.filter(
		eto => !activeEmailTemplates.some(aet => aet.id === eto.id),
	);

	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(
			trpc.emailTemplateGroup.byWorkspace.queryFilter({ handle }),
		);
		await queryClient.invalidateQueries(
			trpc.emailTemplate.byWorkspace.queryFilter({ handle }),
		);
		form.reset();
		await setShowModal(false);
	}, [
		form,
		focusGridList,
		queryClient,
		trpc.emailTemplateGroup.byWorkspace,
		trpc.emailTemplate.byWorkspace,
		handle,
		setShowModal,
	]);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='emails'
				title={
					mode === 'update' ?
						`Update ${lastSelectedItem?.name ?? ''}`
					:	'Create Email Template Group'
				}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					<TextField label='Name' control={form.control} name='name' />
					<TextField label='Description' control={form.control} name='description' />

					<div className='flex w-full flex-col items-start gap-1'>
						<Label>Email Templates</Label>

						<div className='flex w-full flex-col gap-4'>
							{emailTemplateFields.map((field, index) => (
								<div key={field.id} className='flex items-center space-x-2'>
									<Text>{field.name}</Text>
									<Button
										variant='icon'
										startIcon='chevronUp'
										look='ghost'
										size='sm'
										onClick={() => moveEmailTemplate(index, index - 1)}
										disabled={index === 0}
									/>
									<Button
										variant='icon'
										startIcon='chevronDown'
										look='ghost'
										size='sm'
										onClick={() => moveEmailTemplate(index, index + 1)}
										disabled={index === emailTemplateFields.length - 1}
									/>
									<Button
										variant='icon'
										startIcon='delete'
										look='ghost'
										size='sm'
										onClick={() => removeEmailTemplate(index)}
									/>
								</div>
							))}

							<Combobox
								options={availableEmailTemplates}
								getItemId={option => option.id}
								onItemSelect={handleSelectEmailTemplate}
								// selectedItems={activeEmailTemplates}
								// onItemRemove={removeEmailTemplate}
								optTitle={option => option.name}
								optSubtitle={option => option.description}
								displayValue={option => option.name}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth disabled={submitDisabled}>
						{mode === 'update' ?
							'Save Email Template Group'
						:	'Create Email Template Group'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
