'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useLink,
	useLinkSearchParams,
} from '~/app/[handle]/links/_components/link-context';

export function ArchiveOrDeleteLinkModal({ mode }: { mode: 'archive' | 'delete' }) {
	const { selection: linkSelection, lastSelectedItem: lastSelectedLink } = useLink();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useLinkSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.link.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, trpc.link.byWorkspace, setShowModal]);

	const { mutate: archiveLinks, isPending: isPendingArchive } = useMutation(
		trpc.link.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteLinks, isPending: isPendingDelete } = useMutation(
		trpc.link.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedLink) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={linkSelection}
			lastSelected={{ ...lastSelectedLink, name: lastSelectedLink.key }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveLinks}
			deleteItems={deleteLinks}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='link'
		/>
	);
}
