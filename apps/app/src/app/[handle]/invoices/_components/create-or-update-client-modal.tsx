'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useCreateOrUpdateForm } from '@barely/hooks';
import { upsertInvoiceClientSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import {
	useClient,
	useClientSearchParams,
} from '~/app/[handle]/invoices/_components/client-context';

export function CreateOrUpdateClientModal({
	mode,
	onClose,
}: {
	mode: 'create' | 'update';
	onClose?: () => void | Promise<void>;
}) {
	const params = useParams();
	const handle = params.handle as string;
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { lastSelectedItem: selectedClient, focusGridList } = useClient();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useClientSearchParams();

	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const onSettled = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.invoiceClient.byWorkspace.queryKey(),
		});
	}, [queryClient, trpc.invoiceClient]);

	const { mutateAsync: createClient } = useMutation(
		trpc.invoiceClient.create.mutationOptions({
			onSuccess: async () => {
				await setShowModal(false);
			},
			onSettled,
		}),
	);
	const { mutateAsync: updateClient } = useMutation(
		trpc.invoiceClient.update.mutationOptions({
			onSuccess: async () => {
				await setShowModal(false);
			},
			onSettled,
		}),
	);

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedClient ?? null),
		upsertSchema: upsertInvoiceClientSchema,
		defaultValues: {
			name: mode === 'update' ? (selectedClient?.name ?? '') : '',
			email: mode === 'update' ? (selectedClient?.email ?? '') : '',
			company: mode === 'update' ? (selectedClient?.company ?? null) : null,
			address: mode === 'update' ? (selectedClient?.address ?? null) : null,
		},
		handleCreateItem: async d => {
			await createClient({
				...d,
				handle,
			});
		},
		handleUpdateItem: async d => {
			await updateClient({
				...d,
				handle,
			});
		},
	});

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries({
			queryKey: trpc.invoiceClient.byWorkspace.queryKey(),
		});
		await setShowModal(false);
		if (onClose) {
			await onClose();
		}
	}, [focusGridList, queryClient, trpc.invoiceClient, setShowModal, onClose]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertInvoiceClientSchema>) => {
			await onSubmit(data);
		},
		[onSubmit],
	);

	const submitDisabled = mode === 'update' && !form.formState.isDirty;

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={handleCloseModal}
		>
			<ModalHeader
				title={mode === 'create' ? 'Create Client' : 'Update Client'}
				icon='user'
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='space-y-4'>
						<TextField
							control={form.control}
							name='name'
							label='Name'
							placeholder='Client name'
							required
						/>

						<TextField
							control={form.control}
							name='email'
							type='email'
							label='Email'
							placeholder='client@example.com'
							startIcon='email'
							required
						/>

						<TextField
							control={form.control}
							name='company'
							label='Company'
							placeholder='Company name (optional)'
						/>

						<TextAreaField
							control={form.control}
							name='address'
							label='Address'
							placeholder='Billing address (optional)'
							rows={3}
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{mode === 'create' ? 'Create Client' : 'Update Client'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
