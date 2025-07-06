'use client';

import { useCallback } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useEmailTemplateGroup,
	useEmailTemplateGroupSearchParams,
} from './email-template-group-context';

export function ArchiveOrDeleteEmailTemplateGroupModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const { selection, lastSelectedItem } = useEmailTemplateGroup();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useEmailTemplateGroupSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const { handle } = useWorkspace();

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries(
			trpc.emailTemplateGroup.byWorkspace.queryFilter({ handle }),
		);
		await setShowModal(false);
	}, [queryClient, trpc.emailTemplateGroup.byWorkspace, handle, setShowModal]);

	const { mutate: archiveEmailTemplateGroups, isPending: isPendingArchive } = useMutation(
		{
			...trpc.emailTemplateGroup.archive.mutationOptions(),
			onSuccess,
		},
	);

	const { mutate: deleteEmailTemplateGroups, isPending: isPendingDelete } = useMutation({
		...trpc.emailTemplateGroup.delete.mutationOptions(),
		onSuccess,
	});

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{
				...lastSelectedItem,
				name: lastSelectedItem.name,
			}}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveEmailTemplateGroups}
			deleteItems={deleteEmailTemplateGroups}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='emailTemplateGroup'
		/>
	);
}
