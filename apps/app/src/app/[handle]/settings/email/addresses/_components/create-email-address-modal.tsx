'use client';

import type { z } from 'zod';
import { useCallback } from 'react';
import { useEmailDomains } from '@barely/lib/hooks/use-email-domains';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { createEmailAddressSchema } from '@barely/lib/server/routes/email-address/email-address.schema';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useEmailAddressContext } from './email-address-context';

export function CreateEmailAddressModal() {
	const apiUtils = api.useUtils();

	const { showCreateEmailAddressModal, setShowCreateEmailAddressModal, focusGridList } =
		useEmailAddressContext();

	const { mutateAsync: createEmailAddress } = api.emailAddress.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { domains } = useEmailDomains();

	const domainOptions = domains.map(domain => ({
		label: domain.name,
		value: domain.id,
	}));

	const form = useZodForm({
		schema: createEmailAddressSchema,
		defaultValues: {
			username: '',
			domainId: '',
		},
	});

	const { control } = form;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.emailAddress.invalidate();
		form.reset();
		setShowCreateEmailAddressModal(false);
	}, [focusGridList, apiUtils.emailAddress, form, setShowCreateEmailAddressModal]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof createEmailAddressSchema>) => {
			await createEmailAddress(data);
		},
		[createEmailAddress],
	);

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showCreateEmailAddressModal}
			setShowModal={setShowCreateEmailAddressModal}
			preventDefaultClose={preventDefaultClose}
			onClose={handleCloseModal}
			className='max-h-fit max-w-md'
		>
			<ModalHeader icon='email' title='Add Email Address' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='flex flex-row'>
						<TextField
							control={control}
							name='username'
							label='Email address'
							placeholder='user'
						/>

						<TextField
							control={control}
							name='replyTo'
							label='Reply to (optional)'
							placeholder='me@gmail.com'
						/>

						<SelectField
							control={control}
							name='domainId'
							label='Domain'
							options={domainOptions}
						/>
					</div>
					<SwitchField control={control} name='default' label='Default' />
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Add Email Address</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}