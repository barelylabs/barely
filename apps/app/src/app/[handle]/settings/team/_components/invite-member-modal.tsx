'use client';

import type { z } from 'zod/v4';
import { atomWithToggle } from '@barely/atoms';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { inviteMemberSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { useTRPC } from '@barely/api/app/trpc.react';

// import { SelectField } from '@barely/ui/forms/select-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

export const showInviteMemberModalAtom = atomWithToggle(false);

export function InviteMemberModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { workspace } = useWorkspace();
	const [showModal, setShowModal] = useAtom(showInviteMemberModalAtom);

	const form = useZodForm({
		schema: inviteMemberSchema,
		defaultValues: {
			email: '',
			role: 'admin',
		},
	});

	const { mutateAsync: inviteMember } = useMutation({
		...trpc.workspaceInvite.inviteMember.mutationOptions(),
		onSuccess: async () => {
			form.reset();
			setShowModal(false);
			await queryClient.invalidateQueries(trpc.workspace.invites.queryFilter());
		},
	});

	const handleSubmit = async (data: z.infer<typeof inviteMemberSchema>) => {
		await inviteMember({
			...data,
			handle: workspace.handle,
		});
		setShowModal(false);
	};

	return (
		<Modal showModal={showModal} setShowModal={setShowModal} className='h-fit max-w-md'>
			<ModalHeader icon='users' title={`Invite a member to ${workspace.name}`} />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='flex flex-row gap-2'>
						<TextField control={form.control} label='Email' name='email' />
						{/* <SelectField
							control={form.control}
							label='Role'
							name='role'
							options={['admin', 'member']}
						/> */}
					</div>
					<SubmitButton fullWidth>Send invite</SubmitButton>
				</ModalBody>
			</Form>
		</Modal>
	);
}
