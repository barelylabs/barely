'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useEmailAddressContext } from './email-address-context';

export function EmailAddressHotkeys() {
	const { selection, setShowCreateModal, setShowUpdateModal, setShowDeleteModal } =
		useEmailAddressContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
