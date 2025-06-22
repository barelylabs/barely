'use client';

import { useCallback } from 'react';
// import { api } from '@barely/lib/server/api/react';
import { useTRPC } from '@barely/lib/server/api/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useWorkspace } from '@barely/hooks/use-workspace';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cartFunnel-context';

export function ArchiveOrDeleteFunnelModal({ mode }: { mode: 'archive' | 'delete' }) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const {
		cartFunnelSelection,
		lastSelectedCartFunnel,
		showArchiveCartFunnelModal,
		showDeleteCartFunnelModal,
		setShowArchiveCartFunnelModal,
		setShowDeleteCartFunnelModal,
	} = useCartFunnelContext();

	const queryClient = useQueryClient();

	// const apiUtils = api.useUtils();

	const showModal =
		mode === 'archive' ? showArchiveCartFunnelModal : showDeleteCartFunnelModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveCartFunnelModal : setShowDeleteCartFunnelModal;

	const onSuccess = useCallback(async () => {
		// await apiUtils.cartFunnel.invalidate();
		await queryClient.invalidateQueries(
			trpc.cartFunnel.byWorkspace.queryFilter({ handle }),
		);
		setShowModal(false);
	}, [queryClient, trpc.cartFunnel.byWorkspace, handle, setShowModal]);

	const { mutate: archiveFunnels, isPending: isPendingArchive } = useMutation(
		trpc.cartFunnel.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteFunnels, isPending: isPendingDelete } = useMutation(
		trpc.cartFunnel.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedCartFunnel) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={cartFunnelSelection}
			lastSelected={lastSelectedCartFunnel}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveFunnels}
			deleteItems={deleteFunnels}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='cartFunnel'
		/>
	);
}
