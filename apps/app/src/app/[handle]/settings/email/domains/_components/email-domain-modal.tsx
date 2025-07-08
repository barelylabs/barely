import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { z } from 'zod/v4';
import { useEffect, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { createEmailDomainSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

import { atomWithToggle } from '@barely/atoms/atom-with-toggle';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

type EmailDomain = AppRouterOutputs['emailDomain']['byWorkspace']['domains'][number];

export const showEmailDomainModalAtom = atomWithToggle(false);
export const updateEmailDomainAtom = atom<EmailDomain | undefined>(undefined);

export function EmailDomainModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	const [editEmailDomain, setEditEmailDomain] = useAtom(updateEmailDomainAtom);
	const [showEmailDomainModal, setShowEmailDomainModal] = useAtom(
		showEmailDomainModalAtom,
	);

	const form = useZodForm({
		schema: createEmailDomainSchema,
		values: editEmailDomain ?? {
			name: '',
		},
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const { mutateAsync: createEmailDomain } = useMutation({
		...trpc.emailDomain.create.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(trpc.emailDomain.byWorkspace.queryFilter());
			setShowEmailDomainModal(false);
			setEditEmailDomain(undefined);
			form.reset();
		},
	});

	const { mutateAsync: updateEmailDomain } = useMutation({
		...trpc.emailDomain.update.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries(trpc.emailDomain.byWorkspace.queryFilter());
			setShowEmailDomainModal(false);
			setEditEmailDomain(undefined);
			form.reset();
		},
	});

	const handleSubmit = async (data: z.infer<typeof createEmailDomainSchema>) => {
		if (editEmailDomain) {
			return await updateEmailDomain({
				...data,
				id: editEmailDomain.id,
				handle,
			});
		}

		return await createEmailDomain({
			...data,
			handle,
		});
	};

	const [domainInputLocked, setDomainInputLocked] = useState(false);

	useEffect(() => {
		if (editEmailDomain?.name) {
			setDomainInputLocked(true);
		}
	}, [editEmailDomain?.name]);

	const submitDisabled = editEmailDomain && !form.formState.isDirty;

	return (
		<Modal
			showModal={showEmailDomainModal}
			setShowModal={setShowEmailDomainModal}
			onClose={() => {
				form.reset();
			}}
			className='max-h-fit max-w-md'
		>
			<ModalHeader
				icon='domain'
				title={`${editEmailDomain ? 'Edit' : 'Add'} Email Domain`}
			/>
			<ModalBody>
				<Form form={form} onSubmit={handleSubmit}>
					<TextField
						control={form.control}
						name='name'
						label='Your domain'
						labelButton={
							editEmailDomain &&
							domainInputLocked && (
								<button
									className='flex flex-row items-center gap-1 text-right'
									type='button'
									onClick={() => {
										if (
											window.confirm(
												`Warning: Changing your email domain means you won't be able to send email from this domain anymore. Are you sure you want to continue?`,
											)
										) {
											setDomainInputLocked(!domainInputLocked);
										}
									}}
								>
									<Icon.lock className='h-3 w-3' />
									<p>Unlock</p>
								</button>
							)
						}
						disabled={editEmailDomain && domainInputLocked}
						placeholder='hello.example.com'
						infoTooltip='This is the domain that will be used to send emails from.'
					/>
					<SubmitButton disabled={submitDisabled} fullWidth>
						{editEmailDomain ? 'Save changes' : 'Add domain'}
					</SubmitButton>
				</Form>
			</ModalBody>
		</Modal>
	);
}
