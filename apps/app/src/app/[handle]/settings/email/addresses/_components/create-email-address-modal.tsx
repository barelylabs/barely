'use client';

import type { z } from 'zod/v4';
import { useCallback } from 'react';
import { useEmailDomains, useWorkspace, useZodForm } from '@barely/hooks';
import { createEmailAddressSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useEmailAddressSearchParams } from './email-address-context';

export function CreateEmailAddressModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const { showCreateModal, setShowCreateModal } = useEmailAddressSearchParams();

	const { mutateAsync: createEmailAddress } = useMutation(
		trpc.emailAddress.create.mutationOptions({
			onSuccess: async () => {
				await handleCloseModal();
			},
		}),
	);

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
		await queryClient.invalidateQueries({
			queryKey: trpc.emailAddress.byWorkspace.queryKey(),
		});
		form.reset();
		await setShowCreateModal(false);
	}, [queryClient, trpc, form, setShowCreateModal]);

	const handleSubmit = useCallback(
		async (data: z.infer<typeof createEmailAddressSchema>) => {
			await createEmailAddress({
				...data,
				handle,
			});
		},
		[createEmailAddress, handle],
	);

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showCreateModal}
			setShowModal={show => {
				void setShowCreateModal(show);
			}}
			preventDefaultClose={preventDefaultClose}
			onClose={handleCloseModal}
			className='max-h-fit max-w-md'
		>
			<ModalHeader icon='email' title='Add Email Address' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='flex flex-row items-center gap-1.5'>
						<div className='w-full flex-grow'>
							<TextField
								control={control}
								name='username'
								label='Username'
								placeholder='user'
							/>
						</div>
						<Icon.at className='mt-[31px] h-8 w-8 text-muted-foreground' />
						<div className='min-w-1/2 w-full flex-grow'>
							<SelectField
								control={control}
								name='domainId'
								label='Domain'
								options={domainOptions}
								className='flex-grow'
								placeholder='hello.thebeatles.com'
							/>
						</div>
					</div>

					<TextField
						control={control}
						name='defaultFriendlyName'
						label='Friendly Name (optional)'
						placeholder='Paul // The Beatles'
					/>

					<TextField
						control={control}
						name='replyTo'
						label='Reply to (optional)'
						placeholder='paul@thebeatles.com'
					/>
					<SwitchField control={control} name='default' label='Default' />
				</ModalBody>
				<ModalFooter>
					<SubmitButton loadingText='Adding Email Address' fullWidth>
						Add Email Address
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
