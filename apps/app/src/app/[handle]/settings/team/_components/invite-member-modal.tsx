'use client';

import type { z } from 'zod';
import { atomWithToggle } from '@barely/lib/atoms/atom-with-toggle';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { inviteMemberSchema } from '@barely/lib/server/routes/workspace-invite/workspace-invite.schema';
import { useAtom } from 'jotai';

import { Modal, ModalBody, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

export const showInviteMemberModalAtom = atomWithToggle(false);

export function InviteMemberModal() {
	const [showModal, setShowModal] = useAtom(showInviteMemberModalAtom);

	const form = useZodForm({
		schema: inviteMemberSchema,
		defaultValues: {
			email: '',
			role: 'admin',
		},
	});

	const { mutateAsync: inviteMember } = api.workspaceInvite.inviteMember.useMutation({
		onSuccess: () => {
			form.reset();
			setShowModal(false);
		},
	});

	const handleSubmit = async (data: z.infer<typeof inviteMemberSchema>) => {
		await inviteMember(data);
		setShowModal(false);
	};

	return (
		<Modal showModal={showModal} setShowModal={setShowModal} className='h-fit max-w-md'>
			<ModalHeader icon='users' title='Invite a member' />
			<ModalBody>
				<Form form={form} onSubmit={handleSubmit}>
					<TextField control={form.control} label='Email' name='email' />
					<SubmitButton fullWidth>Send invite</SubmitButton>
				</Form>
			</ModalBody>
		</Modal>
	);
}
