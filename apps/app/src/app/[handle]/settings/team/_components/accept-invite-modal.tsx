'use client';

import type { z } from 'zod/v4';
import { useToast } from '@barely/lib/hooks/use-toast';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { acceptInviteSchema } from '@barely/lib/server/routes/workspace-invite/workspace-invite.schema';

import { Modal, ModalBody, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';

import { usePersonalInvitesContext } from '~/app/[handle]/settings/team/_components/personal-invites-context';

export function AcceptInviteModal() {
	const apiUtils = api.useUtils();
	const { toast } = useToast();

	const {
		showAcceptInviteModal,
		setShowAcceptInviteModal,
		acceptInviteWorkspaceId,
		acceptInviteWorkspaceName,
	} = usePersonalInvitesContext();

	const form = useZodForm({
		schema: acceptInviteSchema,
		values: {
			workspaceId: acceptInviteWorkspaceId ?? '',
		},
	});

	const { mutateAsync: acceptInvite } = api.workspaceInvite.acceptInvite.useMutation();

	const handleSubmit = async (data: z.infer<typeof acceptInviteSchema>) => {
		await acceptInvite(data).catch(error => {
			return toast.error(String(error));
		});
		setShowAcceptInviteModal(false);
		await apiUtils.user.workspaceInvites.invalidate();
		await apiUtils.user.workspaces.invalidate();
	};

	if (!acceptInviteWorkspaceId) return null;

	return (
		<Modal
			showModal={showAcceptInviteModal}
			setShowModal={setShowAcceptInviteModal}
			className='h-fit max-w-md'
		>
			<ModalHeader icon='users' title={`Accept Invite to ${acceptInviteWorkspaceName}`} />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SubmitButton>Accept Invite</SubmitButton>
				</ModalBody>
			</Form>
		</Modal>
	);
}
