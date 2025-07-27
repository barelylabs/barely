'use client';

import type { z } from 'zod/v4';
import { useZodForm } from '@barely/hooks';
import { acceptInviteSchema } from '@barely/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

import { usePersonalInvitesContext } from '~/app/[handle]/settings/team/_components/personal-invites-context';

export function AcceptInviteModal() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

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

	const { mutateAsync: acceptInvite } = useMutation({
		...trpc.workspaceInvite.acceptInvite.mutationOptions(),
	});

	const handleSubmit = async (data: z.infer<typeof acceptInviteSchema>) => {
		await acceptInvite(data).catch(error => {
			return toast.error(String(error));
		});
		setShowAcceptInviteModal(false);
		await queryClient.invalidateQueries(trpc.user.workspaceInvites.pathFilter());
		await queryClient.invalidateQueries(trpc.user.workspaces.pathFilter());
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
