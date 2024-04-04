'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cart-funnel-context';

export function ArchiveOrDeleteFunnelModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		cartFunnelSelection: funnelSelection,
		lastSelectedCartFunnel: lastSelectedFunnel,
		showArchiveCartFunnelModal: showArchiveFunnelModal,
		showDeleteCartFunnelModal: showDeleteFunnelModal,
		setShowArchiveCartFunnelModal: setShowArchiveFunnelModal,
		setShowDeleteCartFunnelModal: setShowDeleteFunnelModal,
	} = useCartFunnelContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveFunnelModal : showDeleteFunnelModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveFunnelModal : setShowDeleteFunnelModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.cartFunnel.invalidate();
		setShowModal(false);
	}, [apiUtils.cartFunnel, setShowModal]);

	const { mutate: archiveFunnels, isPending: isPendingArchive } =
		api.cartFunnel.archive.useMutation({ onSuccess });

	const { mutate: deleteFunnels, isPending: isPendingDelete } =
		api.cartFunnel.delete.useMutation({ onSuccess });

	if (!lastSelectedFunnel) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={funnelSelection}
			lastSelected={lastSelectedFunnel}
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
