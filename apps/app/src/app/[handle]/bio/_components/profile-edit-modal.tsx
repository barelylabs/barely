'use client';

import type { BioWithButtons } from '@barely/validators';
import { useZodForm } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

interface ProfileEditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bio: BioWithButtons;
	handle: string;
}

export function ProfileEditModal({
	open,
	onOpenChange,
	bio,
	handle,
}: ProfileEditModalProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const formSchema = z.object({
		title: z.string().min(1, 'Title is required'),
		subtitle: z.string().optional(),
	});

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			title: bio.title ?? '',
			subtitle: bio.subtitle ?? '',
		},
	});

	const updateMutation = useMutation({
		...trpc.bio.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Profile updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
			onOpenChange(false);
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update profile');
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		updateMutation.mutate({
			id: bio.id,
			handle,
			...data,
		});
	};

	return (
		<Modal showModal={open} setShowModal={onOpenChange}>
			<ModalBody>
				<ModalHeader>
					<h2 className='text-lg font-semibold'>Edit Profile</h2>
				</ModalHeader>

				<Form form={form} onSubmit={handleSubmit}>
					<div className='space-y-4'>
						<TextField
							control={form.control}
							name='title'
							label='Name'
							placeholder='Your name or brand'
							description='The main heading on your bio page'
						/>

						<TextAreaField
							control={form.control}
							name='subtitle'
							label='Bio'
							placeholder='Tell visitors about yourself'
							description='A brief description that appears under your name'
							rows={3}
						/>

						<div className='flex justify-end gap-2'>
							<Button type='button' look='outline' onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton>
						</div>
					</div>
				</Form>
			</ModalBody>
		</Modal>
	);
}
