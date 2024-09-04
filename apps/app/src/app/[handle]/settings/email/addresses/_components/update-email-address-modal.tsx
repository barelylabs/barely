'use client';

import type { z } from 'zod';
import { useCallback } from 'react';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updateEmailAddressSchema } from '@barely/lib/server/routes/email-address/email-address.schema';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useEmailAddressContext } from './email-address-context';

export function UpdateEmailAddressModal() {
	const apiUtils = api.useUtils();

	const {
		showUpdateEmailAddressModal,
		setShowUpdateEmailAddressModal,
		focusGridList,
		lastSelectedEmailAddress,
	} = useEmailAddressContext();

	const { mutateAsync: updateEmailAddress } = api.emailAddress.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const form = useZodForm({
		schema: updateEmailAddressSchema,
		values: {
			id: lastSelectedEmailAddress?.id ?? '',
			username: lastSelectedEmailAddress?.username ?? '',
			default: lastSelectedEmailAddress?.default ?? false,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const { control } = form;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailAddress.invalidate();
		form.reset();
		setShowUpdateEmailAddressModal(false);
	}, [focusGridList, apiUtils.emailAddress, form, setShowUpdateEmailAddressModal]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof updateEmailAddressSchema>) => {
			await updateEmailAddress(data);
		},
		[updateEmailAddress],
	);

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showUpdateEmailAddressModal}
			setShowModal={setShowUpdateEmailAddressModal}
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
						placeholder='My Name'
					/>
					<TextField
						control={control}
						name='replyTo'
						label='Reply to (optional)'
						placeholder='me@gmail.com'
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
