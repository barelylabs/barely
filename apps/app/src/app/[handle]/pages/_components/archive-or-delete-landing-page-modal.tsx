'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useLandingPage,
	useLandingPageSearchParams,
} from '~/app/[handle]/pages/_components/landing-page-context';

export function ArchiveOrDeleteLandingPageModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useLandingPageSearchParams();

	const { selection, lastSelectedItem } = useLandingPage();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.landingPage.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, trpc, setShowModal]);

	const { mutate: archiveLandingPages, isPending: isPendingArchive } = useMutation(
		trpc.landingPage.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteLandingPages, isPending: isPendingDelete } = useMutation(
		trpc.landingPage.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveLandingPages}
			deleteItems={deleteLandingPages}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='landingPage'
		/>
	);
}
