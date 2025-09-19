'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { updateEmailAddressSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

import { useEmailAddress, useEmailAddressSearchParams } from './email-address-context';

export function UpdateEmailAddressModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const { showUpdateModal, setShowUpdateModal } = useEmailAddressSearchParams();
	const { lastSelectedItem: lastSelectedEmailAddress } = useEmailAddress();

	const { mutateAsync: updateEmailAddress } = useMutation(
		trpc.emailAddress.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.emailAddress.byWorkspace.queryKey({ handle }),
				});
			},
		}),
	);

	const form = useZodForm({
		schema: updateEmailAddressSchema,
		values: {
			...lastSelectedEmailAddress,
			id: lastSelectedEmailAddress?.id ?? '',
			username: lastSelectedEmailAddress?.username ?? '',
			default: lastSelectedEmailAddress?.default ?? false,
			defaultFriendlyName: lastSelectedEmailAddress?.defaultFriendlyName ?? '',
			replyTo: lastSelectedEmailAddress?.replyTo ?? '',
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const { control } = form;

	const handleCloseModal = useCallback(async () => {
		form.reset();
		await setShowUpdateModal(false);
	}, [form, setShowUpdateModal]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof updateEmailAddressSchema>) => {
			await updateEmailAddress({
				...data,
				handle,
			});
		},
		[updateEmailAddress, handle],
	);

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showUpdateModal}
			setShowModal={show => {
				void setShowUpdateModal(show);
			}}
			preventDefaultClose={preventDefaultClose}
			onClose={handleCloseModal}
			className='max-h-fit max-w-md'
		>
			<ModalHeader icon='email' title='Update Email Address' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<Text variant='lg/semibold'>{lastSelectedEmailAddress?.email}</Text>
					<TextField
						control={control}
						name='defaultFriendlyName'
						label='Friendly Name (optional)'
						placeholder='Paul // The Beatles'
					/>
					<TextField
						control={control}
						name='replyTo'
						label='Reply to (optional)'
						placeholder='paul@thebeatles.com'
					/>

					<SwitchField control={control} name='default' label='Default' />
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Update Email Address</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
