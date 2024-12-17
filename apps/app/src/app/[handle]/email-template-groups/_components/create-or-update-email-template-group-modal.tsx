'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { upsertEmailTemplateGroupSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@barely/ui/elements/button';
import { Combobox } from '@barely/ui/elements/combobox';
import { Label } from '@barely/ui/elements/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useEmailTemplateGroupContext } from './email-template-group-context';

export function CreateOrUpdateEmailTemplateGroupModal({
	mode,
}: {
	mode: 'create' | 'update';
}) {
	const apiUtils = api.useUtils();

	const {
		lastSelectedItem,
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
		focusGridList,
	} = useEmailTemplateGroupContext();

	const { handle } = useWorkspace();

	const { data: selectedEmailTemplates } = api.emailTemplateGroup.byId.useQuery(
		{
			handle,
			id: lastSelectedItem?.id ?? '',
		},
		{
			select: data => data.emailTemplates,
		},
	);

	const { data: emailTemplateOptions } = api.emailTemplate.byWorkspace.useQuery(
		{ handle },
		{
			select: data =>
				data.emailTemplates.map(et => ({
					id: et.id,
					name: et.name,
					description: et.description ?? '',
					// lexorank: et.lexorank,
				})) ?? [],
		},
	);

	const { mutateAsync: createEmailTemplateGroup } =
		api.emailTemplateGroup.create.useMutation({
			onSuccess: async () => {
				await handleCloseModal();
			},
		});

	const { mutateAsync: updateEmailTemplateGroup } =
		api.emailTemplateGroup.update.useMutation({
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
					emailTemplates: selectedEmailTemplates ?? [],
				}
			:	null,
		upsertSchema: upsertEmailTemplateGroupSchema,
		// mode === 'create' ? createEmailTemplateGroupSchema : updateEmailTemplateGroupSchema,
		defaultValues: {
			name: mode === 'update' ? lastSelectedItem?.name ?? '' : '',
			description: mode === 'update' ? lastSelectedItem?.description ?? '' : '',
			emailTemplates: mode === 'update' ? selectedEmailTemplates ?? [] : [],
		},
		handleCreateItem: async d => {
			await createEmailTemplateGroup({
				...d,
				name: d.name ?? '',
			});
		},
		handleUpdateItem: async d => {
			await updateEmailTemplateGroup(d);
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
			if (emailTemplate) {
				appendEmailTemplate(emailTemplate);
			}
		},
		[appendEmailTemplate],
	);

	const activeEmailTemplates = form.watch('emailTemplates');
	const availableEmailTemplates =
		emailTemplateOptions?.filter(
			eto => !activeEmailTemplates.some(aet => aet.id === eto.id),
		) ?? [];

	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailTemplateGroup.invalidate();
		await apiUtils.emailTemplate.invalidate();
		form.reset();
		setShowModal(false);
	}, [
		form,
		focusGridList,
		apiUtils.emailTemplateGroup,
		apiUtils.emailTemplate,
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
								displayValue={option => option.name ?? option.id}
							/>
							{/* <Command>
								<CommandInput />

								<CommandList>
									{availableEmailTemplates.map(et => (
										<CommandItem
											key={et.id}
											value={et.id}
											onSelect={() => handleSelectEmailTemplate(et.id)}
										>
											{et.name}
										</CommandItem>
									))}
								</CommandList>
							</Command> */}

							{/* <MultiSelectField
								name='emailTemplates'
								control={form.control}
								options={emailTemplateOptions ?? []}
								optTitle={option => option.name}
								optSubtitle={option => option.description}
								getItemId={option => option.id}
								displayValue={option => option.name ?? option.id}
							/> */}
						</div>

						{/* <Button
							look='outline'
							startIcon='plus'
							onClick={() => appendEmailTemplate('')}
							className='mt-2'
						>
							Add Email Template
						</Button> */}
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
