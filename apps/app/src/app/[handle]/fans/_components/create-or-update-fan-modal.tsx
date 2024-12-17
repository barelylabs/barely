'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { api } from '@barely/lib/server/api/react';
import { upsertFanSchema } from '@barely/lib/server/routes/fan/fan.schema';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Separator } from '@barely/ui/elements/separator';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useFanContext } from './fan-context';

export function CreateOrUpdateFanModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* fan context */
	const {
		lastSelectedItem: selectedFan,
		showCreateModal,
		showUpdateModal,
		setShowCreateModal,
		setShowUpdateModal,
		focusGridList,
	} = useFanContext();

	/* mutations */
	const { mutateAsync: createFan } = api.fan.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateFan } = api.fan.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : selectedFan ?? null,
		upsertSchema: upsertFanSchema,
		defaultValues: {
			fullName: mode === 'update' ? selectedFan?.fullName ?? '' : '',
			email: mode === 'update' ? selectedFan?.email ?? '' : '',
		},
		handleCreateItem: async d => {
			await createFan(d);
		},
		handleUpdateItem: async d => {
			await updateFan(d);
		},
	});

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await apiUtils.fan.invalidate();
		form.reset();
		setShowModal(false);
	}, [form, focusGridList, apiUtils.fan, setShowModal]);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='user'
				title={mode === 'update' ? `Update ${selectedFan?.fullName ?? ''}` : 'Create Fan'}
			/>

			<Form form={form} onSubmit={onSubmit}>
				<ModalBody>
					<TextField label='Full Name' control={form.control} name='fullName' />
					<TextField label='Email' control={form.control} name='email' />
					<TextField label='Phone Number' control={form.control} name='phoneNumber' />

					<Separator className='my-4' />

					<TextField
						label='Street Address'
						control={form.control}
						name='shippingAddressLine1'
					/>
					<TextField
						label='Address Line 2'
						control={form.control}
						name='shippingAddressLine2'
					/>
					<TextField label='City' control={form.control} name='shippingAddressCity' />
					<TextField
						label='State/Province/Region'
						control={form.control}
						name='shippingAddressState'
					/>
					<TextField
						label='Postal/Zip Code'
						control={form.control}
						name='shippingAddressPostalCode'
					/>
					{/* todo: Add country select field */}
					<Separator className='my-4' />
					<SwitchField
						label='Email Marketing Opt-In'
						control={form.control}
						name='emailMarketingOptIn'
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth disabled={submitDisabled}>
						{mode === 'update' ? 'Save Fan' : 'Create Fan'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
