'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

import { useBiosSearchParams } from './bio-context';

const createBioSchema = z.object({
	key: z
		.string()
		.min(1, 'Key is required')
		.max(50, 'Key must be 50 characters or less')
		.regex(/^[a-z0-9-]+$/, {
			message: 'Key must be lowercase alphanumeric with hyphens only',
		}),
});

type CreateBioData = z.infer<typeof createBioSchema>;

export function CreateBioModal() {
	const router = useRouter();
	const { showCreateModal, setShowCreateModal } = useBiosSearchParams();
	const { handle } = useWorkspace();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useZodForm({
		schema: createBioSchema,
		defaultValues: {
			key: '',
		},
	});

	const { mutate: createBio, isPending } = useMutation(
		trpc.bio.createBio.mutationOptions({
			onSuccess: async data => {
				await queryClient.invalidateQueries(trpc.bio.byWorkspace.pathFilter());
				await setShowCreateModal(false);
				form.reset();
				// Navigate to the new bio's blocks page
				router.push(`/${handle}/bios/blocks?bioKey=${data.key}`);
			},
			onError: error => {
				console.error('Failed to create bio:', error);
			},
		}),
	);

	const handleSubmit = useCallback(
		(data: CreateBioData) => {
			createBio({ handle, ...data });
		},
		[createBio, handle],
	);

	return (
		<Modal showModal={showCreateModal} setShowModal={setShowCreateModal}>
			<ModalHeader icon='bio' title='Create Bio' />
			<ModalBody>
				Choose a unique key for your new bio page. This will be used in the URL.
				<Form form={form} onSubmit={handleSubmit}>
					<TextField
						control={form.control}
						name='key'
						label='Bio Key'
						placeholder='e.g., vip, tour, special-offer'
						description='Lowercase letters, numbers, and hyphens only'
					/>

					<SubmitButton loading={isPending}>Create Bio</SubmitButton>
				</Form>
			</ModalBody>
		</Modal>
	);
}
