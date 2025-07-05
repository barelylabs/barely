'use client';

import { useCallback } from 'react';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useEmailTemplateContext } from './email-template-context';

export function ArchiveOrDeleteEmailTemplateModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useEmailTemplateContext();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.emailTemplate.byWorkspace.queryKey(),
		});
		setShowModal(false);
	}, [queryClient, trpc, setShowModal]);

	const { mutate: archiveEmailTemplates, isPending: isPendingArchive } = useMutation({
		...trpc.emailTemplate.archive.mutationOptions(),
		onSuccess,
	});

	const { mutate: deleteEmailTemplates, isPending: isPendingDelete } = useMutation({
		...trpc.emailTemplate.delete.mutationOptions(),
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
			archiveItems={archiveEmailTemplates}
			deleteItems={deleteEmailTemplates}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='emailTemplate'
		/>
	);
}
