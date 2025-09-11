'use client';

import { useCallback } from 'react';
import { useCreateOrUpdateForm, useWorkspace } from '@barely/hooks';
import { upsertFanSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Separator } from '@barely/ui/separator';

import { useFan, useFanSearchParams } from './fan-context';

export function CreateOrUpdateFanModal({ mode }: { mode: 'create' | 'update' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	/* fan context */
	const { lastSelectedItem: selectedFan, focusGridList } = useFan();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useFanSearchParams();

	/* mutations */
	const { mutateAsync: createFan } = useMutation(
		trpc.fan.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	const { mutateAsync: updateFan } = useMutation(
		trpc.fan.update.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

	/* form */
	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedFan ?? null),
		upsertSchema: upsertFanSchema,
		defaultValues: {
			fullName: mode === 'update' ? (selectedFan?.fullName ?? '') : '',
			email: mode === 'update' ? (selectedFan?.email ?? '') : '',
		},
		handleCreateItem: async d => {
			await createFan({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateFan({
				...d,
				handle,
			});
		},
	});

	/* modal */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(trpc.fan.byWorkspace.pathFilter());
		form.reset();
		await setShowModal(false);
	}, [form, focusGridList, queryClient, trpc, setShowModal]);

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
