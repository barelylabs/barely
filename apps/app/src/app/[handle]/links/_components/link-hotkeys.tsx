'use client';

import { useModalHotKeys } from '@barely/hooks';

import {
	useLink,
	useLinkSearchParams,
} from '~/app/[handle]/links/_components/link-context';

export function LinkHotkeys() {
	const { selection } = useLink();
	const {
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLinkSearchParams();

	useModalHotKeys({
		setShowCreateModal: setShowCreateModal,
		setShowUpdateModal: setShowUpdateModal,
		setShowArchiveModal: setShowArchiveModal,
		setShowDeleteModal: setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
