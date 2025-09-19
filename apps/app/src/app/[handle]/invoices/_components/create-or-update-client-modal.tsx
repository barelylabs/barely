'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCreateOrUpdateForm } from '@barely/hooks';
import { upsertInvoiceClientSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Switch } from '@barely/ui/switch';

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
		await queryClient.invalidateQueries(trpc.invoiceClient.byWorkspace.pathFilter());
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

	const [addAddress, setAddAddress] = useState(
		mode === 'update' ?
			selectedClient?.addressLine1 ?
				true
			:	false
		:	false,
	);

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedClient ?? null),
		upsertSchema: upsertInvoiceClientSchema.extend({
			addressLine1: addAddress ? z.string() : z.string().nullable(),
			city: addAddress ? z.string() : z.string().nullable(),
			state: addAddress ? z.string() : z.string().nullable(),
			country: addAddress ? z.string() : z.string().nullable(),
			postalCode: addAddress ? z.string() : z.string().nullable(),
		}),
		defaultValues: {
			name: mode === 'update' ? (selectedClient?.name ?? '') : '',
			email: mode === 'update' ? (selectedClient?.email ?? '') : '',
			company: mode === 'update' ? (selectedClient?.company ?? null) : null,
			// address: mode === 'update' ? (selectedClient?.address ?? null) : null,
			addressLine1: mode === 'update' ? (selectedClient?.addressLine1 ?? null) : null,
			city: mode === 'update' ? (selectedClient?.city ?? null) : null,
			state: mode === 'update' ? (selectedClient?.state ?? null) : null,
			country: mode === 'update' ? (selectedClient?.country ?? null) : null,
			postalCode: mode === 'update' ? (selectedClient?.postalCode ?? null) : null,
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
		await queryClient.invalidateQueries(trpc.invoiceClient.byWorkspace.pathFilter());
		await setShowModal(false);
		if (onClose) {
			await onClose();
		}
	}, [focusGridList, queryClient, trpc.invoiceClient, setShowModal, onClose]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertInvoiceClientSchema>) => {
			const { addressLine1, addressLine2, city, state, country, postalCode, ...rest } =
				data;
			const addressData =
				addAddress ?
					{
						addressLine1: addressLine1 ?? null,
						addressLine2: addressLine2 ?? null,
						city: city ?? null,
						state: state ?? null,
						country: country ?? null,
						postalCode: postalCode ?? null,
					}
				:	{
						addressLine1: null,
						addressLine2: null,
						city: null,
						state: null,
						country: null,
						postalCode: null,
					};

			await onSubmit({ ...rest, ...addressData });
		},
		[onSubmit, addAddress],
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

						<div className='flex items-center justify-between'>
							<label className='text-sm font-medium'>Add customer address</label>
							<Switch checked={addAddress} onCheckedChange={setAddAddress} size='sm' />
						</div>

						{addAddress && (
							<>
								<SelectField
									label='Country'
									control={form.control}
									name='country'
									options={[
										{
											label: (
												<div className='flex flex-row items-center gap-[1px]'>
													<picture className='mr-2 flex items-center'>
														<img
															alt='United States'
															src={`https://flag.vercel.app/m/US.svg`}
															className='h-[10px] w-[16px]'
														/>
													</picture>
													United States
												</div>
											),
											value: 'US',
										},
										{
											label: (
												<div className='flex flex-row items-center gap-[1px]'>
													<picture className='mr-2 flex items-center'>
														<img
															alt='United Kingdom'
															src={`https://flag.vercel.app/m/GB.svg`}
															className='h-[10px] w-[16px]'
														/>
													</picture>
													United Kingdom
												</div>
											),
											value: 'GB',
										},
									]}
								/>
								<TextField
									label='Address Line 1'
									control={form.control}
									name='addressLine1'
								/>
								<TextField
									label='Address Line 2'
									control={form.control}
									name='addressLine2'
								/>
								<TextField label='City' control={form.control} name='city' />
								<TextField
									label={form.watch('country') === 'GB' ? 'Region' : 'State'}
									control={form.control}
									name='state'
								/>
								<TextField label='Postal Code' control={form.control} name='postalCode' />
							</>
						)}
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
