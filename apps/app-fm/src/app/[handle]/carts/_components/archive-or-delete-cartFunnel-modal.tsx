'use client';

import { useCallback } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useCartFunnel,
	useCartFunnelSearchParams,
} from '~/app/[handle]/carts/_components/cartFunnel-context';

export function ArchiveOrDeleteFunnelModal({ mode }: { mode: 'archive' | 'delete' }) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { selection: cartFunnelSelection, lastSelectedItem: lastSelectedCartFunnel } =
		useCartFunnel();
	const {
		showArchiveModal: showArchiveCartFunnelModal,
		showDeleteModal: showDeleteCartFunnelModal,
		setShowArchiveModal: setShowArchiveCartFunnelModal,
		setShowDeleteModal: setShowDeleteCartFunnelModal,
	} = useCartFunnelSearchParams();

	const queryClient = useQueryClient();

	const showModal =
		mode === 'archive' ? showArchiveCartFunnelModal : showDeleteCartFunnelModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveCartFunnelModal : setShowDeleteCartFunnelModal;

	const onSuccess = useCallback(async () => {
		// await apiUtils.cartFunnel.invalidate();
		await queryClient.invalidateQueries(
			trpc.cartFunnel.byWorkspace.queryFilter({ handle }),
		);
		await setShowModal(false);
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
