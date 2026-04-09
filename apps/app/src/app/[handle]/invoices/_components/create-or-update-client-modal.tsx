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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCcEmails(value: string | null | undefined): string[] | null {
	if (!value) return null;
	const emails = value
		.split(',')
		.map(e => e.trim().toLowerCase())
		.filter(e => e.length > 0);
	return emails.length > 0 ? emails : null;
}

function validateCcEmails(value: string | null | undefined): string | undefined {
	if (!value) return undefined;
	const entries = value
		.split(',')
		.map(e => e.trim())
		.filter(e => e.length > 0);
	const invalid = entries.filter(e => !emailRegex.test(e));
	if (invalid.length > 0) {
		return `Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`;
	}
	return undefined;
}

export function CreateOrUpdateClientModal({
	mode,
	onClose,
}: {
	mode: 'create' | 'update';
	onClose?: (createdClient?: {
		id: string;
		name: string;
		email: string;
	}) => void | Promise<void>;
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
			onSuccess: async data => {
				await setShowModal(false);
				if (onClose && mode === 'create') {
					await onClose(data);
				}
			},
			onSettled,
		}),
	);
	const { mutateAsync: updateClient } = useMutation(
		trpc.invoiceClient.update.mutationOptions({
			onSuccess: async () => {
				await setShowModal(false);
				if (onClose && mode === 'update') {
					await onClose();
				}
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

	// Map selectedClient to form-compatible type (ccEmails: string[] -> string)
	const updateItemForForm =
		mode === 'create' ? null
		: selectedClient ?
			{
				...selectedClient,
				ccEmails: selectedClient.ccEmails?.join(', ') ?? null,
			}
		:	null;

	const { form, onSubmit } = useCreateOrUpdateForm({
		updateItem: updateItemForForm,
		upsertSchema: upsertInvoiceClientSchema.extend({
			// ccEmails is a comma-separated string in the form, parsed to string[] on submit
			ccEmails: z.string().nullable(),
			addressLine1: addAddress ? z.string() : z.string().nullable(),
			city: addAddress ? z.string() : z.string().nullable(),
			state: addAddress ? z.string() : z.string().nullable(),
			country: addAddress ? z.string() : z.string().nullable(),
			postalCode: addAddress ? z.string() : z.string().nullable(),
		}),
		defaultValues: {
			name: mode === 'update' ? (selectedClient?.name ?? '') : '',
			email: mode === 'update' ? (selectedClient?.email ?? '') : '',
			ccEmails: mode === 'update' ? (selectedClient?.ccEmails?.join(', ') ?? null) : null,
			company: mode === 'update' ? (selectedClient?.company ?? null) : null,
			// address: mode === 'update' ? (selectedClient?.address ?? null) : null,
			addressLine1: mode === 'update' ? (selectedClient?.addressLine1 ?? null) : null,
			city: mode === 'update' ? (selectedClient?.city ?? null) : null,
			state: mode === 'update' ? (selectedClient?.state ?? null) : null,
			country: mode === 'update' ? (selectedClient?.country ?? null) : null,
			postalCode: mode === 'update' ? (selectedClient?.postalCode ?? null) : null,
		},
		handleCreateItem: async d => {
			const { ccEmails: ccEmailsStr, ...rest } = d;
			await createClient({
				...rest,
				ccEmails: parseCcEmails(ccEmailsStr),
				handle,
			});
		},
		handleUpdateItem: async d => {
			const { ccEmails: ccEmailsStr, ...rest } = d;
			await updateClient({
				...rest,
				ccEmails: parseCcEmails(ccEmailsStr),
				handle,
			});
		},
	});

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		await queryClient.invalidateQueries(trpc.invoiceClient.byWorkspace.pathFilter());
		await setShowModal(false);
		if (onClose && mode === 'update') {
			await onClose();
		}
	}, [focusGridList, queryClient, trpc.invoiceClient, setShowModal, onClose, mode]);

	const handleSubmit = useCallback(
		async (data: Parameters<typeof onSubmit>[0]) => {
			// Validate CC emails before submitting
			const ccError = validateCcEmails(data.ccEmails);
			if (ccError) {
				form.setError('ccEmails', { message: ccError });
				return;
			}

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
		[onSubmit, addAddress, form],
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
							name='ccEmails'
							label='CC Emails'
							placeholder='accounting@example.com, finance@example.com'
							description='Comma-separated. These emails will receive all invoice communications.'
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
