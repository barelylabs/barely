'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useState } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { api } from '@barely/lib/server/api/react';
import { upsertEmailDomainSchema } from '@barely/lib/server/routes/email-domain/email-domain.schema';
import { cn } from '@barely/lib/utils/cn';

import { Icon } from '@barely/ui/elements/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useEmailDomainContext } from '~/app/[handle]/settings/email/domains/_components/email-domain-context';

export function CreateOrUpdateEmailDomainModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* emailDomain context */
	const {
		lastSelectedEmailDomain: selectedEmailDomain,
		showCreateEmailDomainModal,
		showUpdateEmailDomainModal,
		setShowCreateEmailDomainModal,
		setShowUpdateEmailDomainModal,
		focusGridList,
	} = useEmailDomainContext();

	/* mutations */
	const { mutateAsync: createEmailDomain } = api.emailDomain.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateEmailDomain } = api.emailDomain.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form  */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedEmailDomain ?? null),
		upsertSchema: upsertEmailDomainSchema,
		defaultValues: {
			name: mode === 'update' ? (selectedEmailDomain?.name ?? '') : '',
			region: mode === 'update' ? selectedEmailDomain?.region : 'us-east-1',
			status: mode === 'update' ? selectedEmailDomain?.status : 'not_started',
		},
		handleCreateItem: async d => {
			await createEmailDomain(d);
		},
		handleUpdateItem: async d => {
			await updateEmailDomain(d);
		},
	});

	const { control } = form;

	/* modal */
	const showModal =
		mode === 'create' ? showCreateEmailDomainModal : showUpdateEmailDomainModal;
	const setShowModal =
		mode === 'create' ? setShowCreateEmailDomainModal : setShowUpdateEmailDomainModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailDomain.invalidate();
		form.reset();
		setShowModal(false);
	}, [focusGridList, apiUtils.emailDomain, form, setShowModal]);

	// form submit
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertEmailDomainSchema>) => {
			await onSubmit(data);
		},
		[onSubmit],
	);

	const [domainInputLocked, setDomainInputLocked] = useState(false);

	useEffect(() => {
		if (mode === 'update' && selectedEmailDomain?.name) {
			setDomainInputLocked(true);
		}
	}, [mode, selectedEmailDomain?.name]);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;
	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={preventDefaultClose}
			onClose={handleCloseModal}
			className={cn('max-h-fit', mode === 'update' ? 'max-w-xl' : 'max-w-md')}
		>
			<ModalHeader
				icon='domain'
				title={
					mode === 'create' ? 'Add Email Domain' : `Update ${selectedEmailDomain?.name}`
				}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						control={control}
						name='name'
						label='Your domain'
						labelButton={
							mode === 'update' &&
							domainInputLocked && (
								<button
									className='flex flex-row items-center gap-1 text-right'
									type='button'
									onClick={() => {
										window.confirm(
											`Warning: Changing your email domain means you won't be able to send email from this domain anymore. Are you sure you want to continue?`,
										) && setDomainInputLocked(!domainInputLocked);
									}}
								>
									<Icon.lock className='h-3 w-3' />
									<p>Unlock</p>
								</button>
							)
						}
						disabled={mode === 'update' && selectedEmailDomain && domainInputLocked}
						placeholder='hello.example.com'
						infoTooltip='This is the domain that will be used to send emails from.'
					/>
					<SwitchField
						control={control}
						name='openTracking'
						label='Open Tracking'
						infoTooltip='This will track opens on your emails.'
					/>
					<SwitchField
						control={control}
						name='clickTracking'
						label='Click Tracking'
						infoTooltip='This will track clicks on marketing links in your emails.'
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'create' ? 'Add Domain' : 'Update Domain'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
