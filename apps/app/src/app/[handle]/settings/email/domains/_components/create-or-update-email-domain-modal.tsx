'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useState } from 'react';
import { useCreateOrUpdateForm, useFocusGridList, useWorkspace } from '@barely/hooks';
import { cn } from '@barely/utils';
import { upsertEmailDomainSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import {
	useEmailDomain,
	useEmailDomainSearchParams,
} from '~/app/[handle]/settings/email/domains/_components/email-domain-context';

export function CreateOrUpdateEmailDomainModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const focusGridList = useFocusGridList('email-domains');

	/* emailDomain hooks */
	const { lastSelectedItem: selectedEmailDomain } = useEmailDomain();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useEmailDomainSearchParams();

	/* mutations */
	const { mutateAsync: createEmailDomain } = useMutation({
		...trpc.emailDomain.create.mutationOptions(),
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateEmailDomain } = useMutation({
		...trpc.emailDomain.update.mutationOptions(),
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
			await createEmailDomain({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateEmailDomain({
				...d,
				handle,
			});
		},
	});

	const { control } = form;

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(trpc.emailDomain.byWorkspace.queryFilter());
		form.reset();
		await setShowModal(false);
	}, [focusGridList, queryClient, trpc, form, setShowModal]);

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
										if (
											window.confirm(
												`Warning: Changing your email domain means you won't be able to send email from this domain anymore. Are you sure you want to continue?`,
											)
										) {
											setDomainInputLocked(!domainInputLocked);
										}
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
