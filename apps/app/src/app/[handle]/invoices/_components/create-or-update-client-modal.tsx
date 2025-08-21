'use client';

import { useParams } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@barely/ui/dialog';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';

import {
	useClient,
	useClientSearchParams,
} from '~/app/[handle]/invoices/_components/client-context';

// Define the form schema
const clientFormSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	email: z.email('Invalid email address'),
	company: z.string().max(255).optional().nullable(),
	address: z.string().max(500).optional().nullable(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface CreateOrUpdateClientModalProps {
	mode: 'create' | 'update';
}

export function CreateOrUpdateClientModal({ mode }: CreateOrUpdateClientModalProps) {
	const params = useParams();
	const handle = params.handle as string;
	const trpc = useTRPC();
	const utils = trpc.useUtils();

	const { selection, clearSelection } = useClient();
	const { showCreateModal, showUpdateModal, setShowCreateModal, setShowUpdateModal } =
		useClientSearchParams();

	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	// Get the selected client for update mode
	const clientId = mode === 'update' ? Array.from(selection)[0] : undefined;
	const { data: client } = useQuery({
		...trpc.invoiceClient.byId.queryOptions({ handle, id: clientId ?? '' }),
		enabled: mode === 'update' && !!clientId,
	});

	const form = useZodForm({
		schema: clientFormSchema,
		defaultValues: {
			name: client?.name ?? '',
			email: client?.email ?? '',
			company: client?.company ?? '',
			address: client?.address ?? '',
		},
	});

	// Reset form when client changes
	if (client && mode === 'update') {
		form.reset({
			name: client.name,
			email: client.email,
			company: client.company ?? '',
			address: client.address ?? '',
		});
	}

	const { mutate: createClient, isPending: isCreating } = useMutation({
		...trpc.invoiceClient.create.mutationOptions(),
		onSuccess: () => {
			toast.success('Client created successfully');
			utils.invoiceClient.byWorkspace.invalidate();
			form.reset();
			setShowModal(false);
		},
		onError: error => {
			toast.error(error.message || 'Failed to create client');
		},
	});

	const { mutate: updateClient, isPending: isUpdating } = useMutation({
		...trpc.invoiceClient.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Client updated successfully');
			utils.invoiceClient.byWorkspace.invalidate();
			clearSelection();
			setShowModal(false);
		},
		onError: error => {
			toast.error(error.message || 'Failed to update client');
		},
	});

	const handleSubmit = (data: ClientFormData) => {
		// Convert empty strings to null for optional fields
		const processedData = {
			...data,
			company: data.company ?? null,
			address: data.address ?? null,
		};

		if (mode === 'update' && clientId) {
			updateClient({
				handle,
				id: clientId,
				...processedData,
			});
		} else {
			createClient({
				handle,
				...processedData,
			});
		}
	};

	const isLoading = isCreating || isUpdating;

	return (
		<Dialog open={showModal} onOpenChange={setShowModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Add New Client' : 'Edit Client'}
					</DialogTitle>
				</DialogHeader>

				<Form form={form} onSubmit={handleSubmit}>
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

						<div className='flex justify-end pt-4'>
							<SubmitButton loading={isLoading}>
								{mode === 'create' ? 'Create Client' : 'Update Client'}
							</SubmitButton>
						</div>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
