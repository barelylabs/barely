'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useLandingPageContext } from '~/app/[handle]/pages/_components/landing-page-context';

export function LandingPageHotkeys() {
	const {
		selection,
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLandingPageContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateModal,
		setShowUpdateModal: setShowUpdateModal,
		setShowArchiveModal: setShowArchiveModal,
		setShowDeleteModal: setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
